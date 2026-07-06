"use client"

import { useState, useCallback } from "react"
import * as StellarSdk from "@stellar/stellar-sdk"
import { getOrderbook } from "@/lib/dex"
import type { Order } from "@/types"

export function useOrderbook() {
  const [bids, setBids] = useState<Order[]>([])
  const [asks, setAsks] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrderbook = useCallback(
    async (selling: StellarSdk.Asset, buying: StellarSdk.Asset) => {
      setLoading(true)
      setError(null)

      try {
        const result = await getOrderbook(selling, buying)
        setBids(result.bids)
        setAsks(result.asks)
      } catch (err: unknown) {
        const error = err as { message?: string }
        setError(error?.message ?? "Failed to fetch orderbook")
        setBids([])
        setAsks([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { bids, asks, loading, error, fetchOrderbook }
}
