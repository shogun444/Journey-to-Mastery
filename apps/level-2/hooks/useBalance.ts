"use client"

import { useState, useEffect, useCallback } from "react"
import { horizon } from "@/lib/stellar"
import type { Token } from "@/types"

export function useBalance(address: string | null) {
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalances = useCallback(async () => {
    if (!address) {
      setBalances({})
      return
    }

    setLoading(true)
    setError(null)

    try {
      const account = await horizon.loadAccount(address)
      const result: Record<string, string> = {}

      for (const b of account.balances) {
        if (b.asset_type === "native") {
          result["native"] = b.balance
        } else if (b.asset_type === "credit_alphanum4" || b.asset_type === "credit_alphanum12") {
          const key = `${b.asset_code}:${b.asset_issuer}`
          result[key] = b.balance
        }
      }

      setBalances(result)
    } catch (err: unknown) {
      const error = err as { response?: { status?: number }; message?: string }
      if (error?.response?.status === 404) {
        setBalances({})
      } else {
        setError(error?.message ?? "Failed to fetch balances")
      }
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchBalances()
    const interval = setInterval(fetchBalances, 15000)
    return () => clearInterval(interval)
  }, [fetchBalances])

  const getTokenBalance = useCallback(
    (token: Token): string => {
      if (token.code === "XLM") return balances["native"] ?? "0"
      const key = `${token.code}:${token.issuer}`
      return balances[key] ?? "0"
    },
    [balances]
  )

  return { balances, loading, error, refetch: fetchBalances, getTokenBalance }
}
