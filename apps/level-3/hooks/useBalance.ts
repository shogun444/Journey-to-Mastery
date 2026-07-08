"use client"

import { useState, useEffect, useCallback } from "react"
import { getHorizon } from "@/lib/stellar"
import { getUserBalance } from "@/lib/vault"

export function useBalance(address: string | null, refreshKey?: number, eventCount?: number) {
  const [xlmBalance, setXlmBalance] = useState("0")
  const [stXlmBalance, setStXlmBalance] = useState("0")
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!address) {
      setXlmBalance("0")
      setStXlmBalance("0")
      return
    }

    setLoading(true)

    const [horizonResult, stxlm] = await Promise.all([
      getHorizon()
        .loadAccount(address)
        .then((account) => {
          const native = account.balances.find(
            (b: { asset_type: string; balance: string }) => b.asset_type === "native"
          )
          return native?.balance ?? "0"
        })
        .catch(() => "0"),
      getUserBalance(address).then((b) => b ?? "0"),
    ])

    setXlmBalance(horizonResult)
    setStXlmBalance(stxlm)
    setLoading(false)
  }, [address])

  useEffect(() => {
    const timer = setTimeout(refresh, 0)
    const interval = setInterval(refresh, 30000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [refresh, refreshKey, eventCount])

  return { xlmBalance, stXlmBalance, loading, refresh }
}
