"use client"

import { buildDepositTx, buildWithdrawTx } from "@/lib/vault"
import { submitSorobanTransaction } from "@/lib/transactions"
import { useTransactionStatus } from "./useTransactionStatus"
import type { TxState } from "@/types"

interface UseStakeReturn {
  state: TxState
  deposit: (source: string, sign: (xdr: string) => Promise<string>, assets: string, onSuccess?: (hash: string) => void) => Promise<void>
  withdraw: (source: string, sign: (xdr: string) => Promise<string>, shares: string, onSuccess?: (hash: string) => void) => Promise<void>
  reset: () => void
}

export function useStake(): UseStakeReturn {
  const { state, updateStatus, startPolling, reset } = useTransactionStatus()

  const saveTx = (type: "stake" | "unstake", amount: string, hash: string) => {
    try {
      const stored = JSON.parse(localStorage.getItem("stxlm_txs") || "[]")
      stored.unshift({
        id: hash,
        type,
        amount: (Number(amount) / 10_000_000).toFixed(2),
        asset: type === "stake" ? "XLM" : "stXLM",
        timestamp: new Date().toISOString(),
        hash,
        status: "success",
      })
      localStorage.setItem("stxlm_txs", JSON.stringify(stored.slice(0, 50)))
    } catch {
      // silent
    }
  }

  const deposit = async (
    source: string,
    sign: (xdr: string) => Promise<string>,
    assets: string,
    onSuccess?: (hash: string) => void
  ) => {
    try {
      updateStatus("building")
      const xdr = await buildDepositTx(source, assets)
      updateStatus("signing")
      const signedXdr = await sign(xdr)
      updateStatus("submitting")
      const { hash } = await submitSorobanTransaction(signedXdr)
      saveTx("stake", assets, hash)
      await startPolling(hash)
      if (onSuccess) onSuccess(hash)
    } catch (err: unknown) {
      updateStatus("failed", { error: err instanceof Error ? err.message : "Transaction failed" })
    }
  }

  const withdraw = async (
    source: string,
    sign: (xdr: string) => Promise<string>,
    shares: string,
    onSuccess?: (hash: string) => void
  ) => {
    try {
      updateStatus("building")
      const xdr = await buildWithdrawTx(source, shares)
      updateStatus("signing")
      const signedXdr = await sign(xdr)
      updateStatus("submitting")
      const { hash } = await submitSorobanTransaction(signedXdr)
      saveTx("unstake", shares, hash)
      await startPolling(hash)
      if (onSuccess) onSuccess(hash)
    } catch (err: unknown) {
      updateStatus("failed", { error: err instanceof Error ? err.message : "Transaction failed" })
    }
  }

  return { state, deposit, withdraw, reset }
}
