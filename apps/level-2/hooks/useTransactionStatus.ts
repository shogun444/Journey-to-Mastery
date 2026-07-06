"use client"

import { useState, useEffect, useCallback } from "react"
import { horizon } from "@/lib/stellar"

interface TxStatusInfo {
  confirmed: boolean
  success: boolean
  ledger?: number
  pagingToken?: string
}

export function useTransactionStatus(hash: string | null) {
  const [status, setStatus] = useState<TxStatusInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const pollStatus = useCallback(async () => {
    if (!hash) return

    setLoading(true)

    try {
      const tx = await horizon.transactions().transaction(hash).call()
      setStatus({
        confirmed: true,
        success: tx.successful,
        ledger: tx.ledger_attr,
        pagingToken: tx.paging_token,
      })
    } catch {
      setStatus({ confirmed: false, success: false })
    } finally {
      setLoading(false)
    }
  }, [hash])

  useEffect(() => {
    if (!hash) {
      setStatus(null)
      return
    }

    pollStatus()
    const interval = setInterval(pollStatus, 3000)
    return () => clearInterval(interval)
  }, [hash, pollStatus])

  return { status, loading, refetch: pollStatus }
}
