"use client"

import { useState, useEffect, useCallback } from "react"
import { horizon } from "@/lib/stellar"
import type { Transaction } from "@/types"

export function useTransactions(address: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTransactions = useCallback(async () => {
    if (!address) {
      setTransactions([])
      return
    }

    setLoading(true)

    try {
      const { records } = await horizon
        .operations()
        .forAccount(address)
        .order("desc")
        .limit(20)
        .call()

      const txs: Transaction[] = []

      for (const op of records) {
        if (op.type !== "payment" && op.type !== "path_payment_strict_send" && op.type !== "path_payment_strict_receive") continue
        const p = op as {
          id: string
          transaction_hash: string
          from: string
          to?: string
          amount?: string
          source_amount?: string
          asset_code?: string
          created_at: string
          transaction_successful: boolean
        }
        txs.push({
          id: p.id,
          hash: p.transaction_hash,
          type: op.type === "payment"
            ? (p.from === address ? "send" : "receive")
            : "swap",
          amount: p.amount || p.source_amount || "0",
          asset: p.asset_code || "XLM",
          counterparty: p.from === address ? (p.to || "") : p.from,
          timestamp: p.created_at,
          status: p.transaction_successful ? "success" : "failed",
        })
      }

      setTransactions(txs)
    } catch {
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, loading, refetch: fetchTransactions }
}
