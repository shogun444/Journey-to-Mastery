"use client"

import { useState, useEffect, useCallback } from "react"
import { getVaultState as fetchVaultState, getExchangeRate as fetchExchangeRate, isValidStellarAddress } from "@/lib/vault"
import type { VaultState } from "@/types"

export function useVault(address?: string | null, eventCount?: number) {
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

  const refresh = useCallback(async () => {
    if (!address || !isValidStellarAddress(address)) {
      setVaultState({
        totalAssets: "0",
        totalSupply: "0",
        exchangeRateNumer: "1",
        exchangeRateDenom: "1",
        paused: false,
        depositFeeBps: 0,
        withdrawFeeBps: 0,
      })
      setExchangeRate("1.0000")
      return
    }
    setLoading(true)
    try {
      const [state, rate] = await Promise.all([
        fetchVaultState(address),
        fetchExchangeRate(address),
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
  }, [address])

  useEffect(() => {
    const timer = setTimeout(refresh, 0)
    const interval = setInterval(refresh, 30000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [refresh, eventCount])

  return { vaultState, exchangeRate, loading, refresh }
}
