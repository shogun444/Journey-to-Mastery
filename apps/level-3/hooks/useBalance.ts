"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import * as StellarSdk from "@stellar/stellar-sdk"
import { getHorizon, getRpc, config, VAULT_CONTRACT_ID } from "@/lib/stellar"

const STROOP_TO_XLM = 10_000_000

function vaultContract() {
  return new StellarSdk.Contract(VAULT_CONTRACT_ID)
}

export function useBalance(address: string | null) {
  const [xlmBalance, setXlmBalance] = useState("0")
  const [stXlmBalance, setStXlmBalance] = useState("0")
  const [loading, setLoading] = useState(false)
  const initialised = useRef(false)

  const fetchStXlmBalance = useCallback(async (addr: string) => {
    try {
      const sim = await getRpc().simulateTransaction(
        new StellarSdk.TransactionBuilder(await getRpc().getAccount(VAULT_CONTRACT_ID), {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: config.networkPassphrase,
        })
          .addOperation(
            vaultContract().call(
              "get_user_balance",
              StellarSdk.Address.fromString(addr).toScVal()
            )
          )
          .setTimeout(30)
          .build()
      )
      if (StellarSdk.rpc.Api.isSimulationSuccess(sim) && sim.result) {
        const raw = StellarSdk.scValToNative(sim.result.retval)
        return (Number(raw) / STROOP_TO_XLM).toFixed(7)
      }
    } catch {
      // silent
    }
    return "0"
  }, [])

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

      const stxlm = await fetchStXlmBalance(address)
      if (!cancelled) {
        setStXlmBalance(stxlm)
      }

      if (!cancelled) setLoading(false)
    }

    fetchBalances()
    const interval = setInterval(fetchBalances, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [address, fetchStXlmBalance])

  return { xlmBalance, stXlmBalance, loading }
}
