"use client"

import { useState } from "react"
import { pollTransaction } from "@/lib/transactions"
import type { TxState, TxStatus } from "@/types"

export function useTransactionStatus() {
  const [state, setState] = useState<TxState>({ status: "idle" })

  const updateStatus = (status: TxStatus, extra?: Partial<TxState>) => {
    setState((prev) => ({ ...prev, status, ...extra }))
  }

  const startPolling = async (hash: string) => {
    updateStatus("pending", { hash })
    const result = await pollTransaction(hash)
    setState(result)
  }

  const reset = () => setState({ status: "idle" })

  return { state, updateStatus, startPolling, reset }
}
