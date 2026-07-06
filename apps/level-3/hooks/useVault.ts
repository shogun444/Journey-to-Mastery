"use client"

import { useState, useCallback } from "react"
import { getVaultState as fetchVaultState } from "@/lib/vault"
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
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const state = await fetchVaultState()
      setVaultState({
        totalAssets: state.totalAssets,
        totalSupply: state.totalSupply,
        exchangeRateNumer: state.totalAssets,
        exchangeRateDenom: state.totalSupply || "1",
        paused: state.paused,
        depositFeeBps: state.depositFeeBps,
        withdrawFeeBps: state.withdrawFeeBps,
      })
    } catch {
      // keep previous state
    }
    setLoading(false)
  }, [])

  return { vaultState, loading, refresh }
}
