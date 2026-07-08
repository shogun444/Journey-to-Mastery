"use client"

import { useState, useEffect, useRef } from "react"
import { getRpc, VAULT_CONTRACT_ID } from "@/lib/stellar"
import * as StellarSdk from "@stellar/stellar-sdk"

const CURSOR_KEY = "vault_events_cursor"
const LEDGER_KEY = "vault_last_ledger"

function loadCursor(): string | undefined {
  if (typeof window === "undefined") return
  try {
    return localStorage.getItem(CURSOR_KEY) || undefined
  } catch {
    return
  }
}

function saveCursor(cursor: string) {
  try {
    localStorage.setItem(CURSOR_KEY, cursor)
  } catch {
    // silent
  }
}

function loadLastLedger(): number | undefined {
  if (typeof window === "undefined") return
  try {
    const v = localStorage.getItem(LEDGER_KEY)
    return v ? Number(v) : undefined
  } catch {
    return
  }
}

function saveLastLedger(ledger: number) {
  try {
    localStorage.setItem(LEDGER_KEY, String(ledger))
  } catch {
    // silent
  }
}

export function useSorobanEvents(address: string | null) {
  const [eventCount, setEventCount] = useState(0)
  const cursorRef = useRef<string | undefined>(loadCursor())
  const initialised = useRef(false)

  useEffect(() => {
    if (!address) return

    let cancelled = false

    const poll = async () => {
      try {
        const lastLedger = loadLastLedger()
        const latestLedger = (await getRpc().getLatestLedger()).sequence
        const startLedger = cursorRef.current ? latestLedger : (lastLedger ?? latestLedger)

        const options: Record<string, unknown> = {
          startLedger,
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
          delete options.startLedger
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

          if (event.ledger) {
            saveLastLedger(event.ledger)
          }
        }

        if (newEvents > 0) {
          setEventCount((prev) => prev + newEvents)
        }

        if (response.cursor) {
          cursorRef.current = response.cursor
          saveCursor(response.cursor)
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
