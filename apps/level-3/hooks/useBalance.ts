"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { getHorizon } from "@/lib/stellar"
import { getUserBalance } from "@/lib/vault"

export function useBalance(address: string | null, refreshKey?: number, eventCount?: number) {
  const [xlmBalance, setXlmBalance] = useState("0")
  const [stXlmBalance, setStXlmBalance] = useState("0")
  const [loading, setLoading] = useState(false)
  const initialised = useRef(false)

  const refresh = useCallback(async () => {
    if (!address) {
      setXlmBalance("0")
      setStXlmBalance("0")
      return
    }

    setLoading(true)

    try {
      const account = await getHorizon().loadAccount(address)
      const native = account.balances.find(
        (b: { asset_type: string; balance: string }) => b.asset_type === "native"
      )
      setXlmBalance(native?.balance ?? "0")
    } catch {
      setXlmBalance("0")
    }

    const stxlm = await getUserBalance(address)
    setStXlmBalance(stxlm ?? "0")

    setLoading(false)
  }, [address])

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
        if (!cancelled) setXlmBalance(native?.balance ?? "0")
      } catch {
        if (!cancelled) setXlmBalance("0")
      }

      const stxlm = await getUserBalance(address)
      if (!cancelled) setStXlmBalance(stxlm ?? "0")

      if (!cancelled) setLoading(false)
    }

    const timer = setTimeout(fetchBalances, 0)
    const interval = setInterval(fetchBalances, 30000)
    return () => {
      cancelled = true
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [address, refreshKey, eventCount])

  return { xlmBalance, stXlmBalance, loading, refresh }
}
