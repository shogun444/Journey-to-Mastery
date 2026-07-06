"use client"

import { useState, useEffect, useRef } from "react"
import { getHorizon } from "@/lib/stellar"

export function useBalance(address: string | null) {
  const [xlmBalance, setXlmBalance] = useState("0")
  const [stXlmBalance, setStXlmBalance] = useState("0")
  const [loading, setLoading] = useState(false)
  const initialised = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function fetchBalances() {
      if (!address) {
        if (!initialised.current) {
          setXlmBalance("0")
          setStXlmBalance("0")
          initialised.current = true
        }
        return
      }

      setLoading(true)
      try {
        const account = await getHorizon().loadAccount(address)
        const native = account.balances.find(
          (b: { asset_type: string; balance: string }) => b.asset_type === "native"
        )
        if (!cancelled) {
          setXlmBalance(native?.balance ?? "0")
        }
      } catch {
        if (!cancelled) setXlmBalance("0")
      }
      if (!cancelled) setLoading(false)
    }

    fetchBalances()
    const interval = setInterval(fetchBalances, 15000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [address])

  return { xlmBalance, stXlmBalance, loading }
}
