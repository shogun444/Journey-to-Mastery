"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getVaultState as fetchVaultState, getExchangeRate as fetchExchangeRate } from "@/lib/vault"
import type { VaultState } from "@/types"

export function useVault() {
  const [vaultState, setVaultState] = useState<VaultState>({
    totalAssets: "0",
    totalSupply: "0",
    exchangeRateNumer: "1",
    exchangeRateDenom: "1",
    paused: false,
    depositFeeBps: 0,
    withdrawFeeBps: 0,
  })
  const [exchangeRate, setExchangeRate] = useState("1.0000")
  const [loading, setLoading] = useState(false)
  const initialised = useRef(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [state, rate] = await Promise.all([
        fetchVaultState(),
        fetchExchangeRate(),
      ])
      setVaultState({
        totalAssets: state.totalAssets,
        totalSupply: state.totalSupply,
        exchangeRateNumer: state.totalAssets,
        exchangeRateDenom: state.totalSupply || "1",
        paused: state.paused,
        depositFeeBps: state.depositFeeBps,
        withdrawFeeBps: state.withdrawFeeBps,
      })
      setExchangeRate(rate)
    } catch {
      // keep previous state
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!initialised.current) {
      initialised.current = true
      refresh()
    }
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [refresh])

  return { vaultState, exchangeRate, loading, refresh }
}
