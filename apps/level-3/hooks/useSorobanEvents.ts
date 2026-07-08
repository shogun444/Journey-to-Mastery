"use client"

import { useState, useEffect, useRef } from "react"
import { getRpc, VAULT_CONTRACT_ID } from "@/lib/stellar"
import * as StellarSdk from "@stellar/stellar-sdk"

export function useSorobanEvents(address: string | null) {
  const [eventCount, setEventCount] = useState(0)
  const cursorRef = useRef<string | undefined>(undefined)
  const initialised = useRef(false)

  useEffect(() => {
    if (!address) return

    let cancelled = false

    const poll = async () => {
      try {
        const options: Record<string, unknown> = {
          startLedger: 0,
          filters: [
            {
              type: "contract",
              contractIds: [VAULT_CONTRACT_ID],
            },
          ],
          pagination: { limit: 20 },
        }

        if (cursorRef.current) {
          options.pagination = { ...(options.pagination as object), cursor: cursorRef.current }
        }

        const response = await getRpc().getEvents(options as never)

        if (cancelled) return

        let newEvents = 0
        for (const event of response.events || []) {
          const topicVal = event.topic?.[0]
          if (!topicVal) continue

          try {
            const topicStr = String(StellarSdk.scValToNative(topicVal))
            if (topicStr === "deposited" || topicStr === "withdrawn") {
              newEvents++
            }
          } catch {
            continue
          }
        }

        if (newEvents > 0) {
          setEventCount((prev) => prev + newEvents)
        }

        if (response.cursor) {
          cursorRef.current = response.cursor
        }
      } catch {
        // silent — poll will retry on next interval
      }
    }

    if (!initialised.current) {
      initialised.current = true
      poll()
    }

    const interval = setInterval(poll, 8000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [address])

  return { eventCount }
}
