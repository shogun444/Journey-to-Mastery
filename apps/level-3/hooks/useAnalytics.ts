"use client"

import { useState, useEffect, useCallback } from "react"
import { getVaultState, getExchangeRate, getUserBalance } from "@/lib/vault"
import { getHorizon } from "@/lib/stellar"

interface Snapshot {
  timestamp: string
  stxlmBalance: number
  xlmBalance: number
  exchangeRate: number
  totalAssets: number
}

export interface ChartPoint {
  time: string
  label: string
  value: number
}

export interface ActivityPoint {
  time: string
  label: string
  deposit: number
  withdraw: number
}

interface AnalyticsData {
  snapshots: Snapshot[]
  portfolioData: ChartPoint[]
  activityData: ActivityPoint[]
  rateData: ChartPoint[]
  totalReturns: number
  totalVolume: number
  tradeCount: number
  apy: number
  loading: boolean
  stxlmBalance: number
  xlmBalance: number
  exchangeRate: number
}

const SNAPSHOT_KEY = "stxlm_snapshots"

function loadSnapshots(): Snapshot[] {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "[]")
  } catch {
    return []
  }
}

function loadTxs() {
  try {
    return JSON.parse(localStorage.getItem("stxlm_txs") || "[]")
  } catch {
    return []
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function useAnalytics(address: string | null, eventCount?: number) {
  const [data, setData] = useState<AnalyticsData>({
    snapshots: [],
    portfolioData: [],
    activityData: [],
    rateData: [],
    totalReturns: 0,
    totalVolume: 0,
    tradeCount: 0,
    apy: 0,
    loading: true,
    stxlmBalance: 0,
    xlmBalance: 0,
    exchangeRate: 1,
  })
  const refresh = useCallback(async () => {
    if (!address) {
      setData((prev) => ({ ...prev, loading: false }))
      return
    }

    const existing = loadSnapshots()
    const txs = loadTxs()

    try {
      const account = await getHorizon().loadAccount(address)
      const native = account.balances.find((b: { asset_type: string }) => b.asset_type === "native")
      const xlmNum = Number(native?.balance ?? "0")

      const vaultState = await getVaultState(address)
      const vaultRate = await getExchangeRate(address)
      const vaultStateNum = Number(vaultState.totalAssets) / 10_000_000
      const rateNum = Number(vaultRate) || 1

      const bal = await getUserBalance(address)
      const stxlmNum = Number(bal ?? "0")

      const newSnapshot: Snapshot = {
        timestamp: new Date().toISOString(),
        stxlmBalance: stxlmNum,
        xlmBalance: xlmNum,
        exchangeRate: rateNum,
        totalAssets: vaultStateNum,
      }

      const allSnapshots = [...existing, newSnapshot].slice(-200)
      try {
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(allSnapshots))
      } catch {
        // silent
      }

      const portfolioData: ChartPoint[] = allSnapshots.map((s) => ({
        time: s.timestamp,
        label: formatTime(s.timestamp),
        value: s.stxlmBalance,
      }))

      const rateData: ChartPoint[] = allSnapshots.map((s) => ({
        time: s.timestamp,
        label: formatTime(s.timestamp),
        value: s.exchangeRate,
      }))

      const activityMap = new Map<string, { deposit: number; withdraw: number; label: string }>()
      for (const tx of txs) {
        const day = formatTime(tx.timestamp)
        const existing = activityMap.get(day) || { deposit: 0, withdraw: 0, label: day }
        if (tx.type === "stake") existing.deposit += Number(tx.amount) || 0
        if (tx.type === "unstake") existing.withdraw += Number(tx.amount) || 0
        activityMap.set(day, existing)
      }
      const activityData: ActivityPoint[] = Array.from(activityMap.entries())
        .map(([day, val]) => ({
          time: day,
          label: val.label,
          deposit: val.deposit,
          withdraw: val.withdraw,
        }))
        .sort((a, b) => a.time.localeCompare(b.time))

      const totalVolume = activityData.reduce((sum, a) => sum + a.deposit, 0)
      const tradeCount = txs.length
      const totalReturns = stxlmNum * rateNum - stxlmNum
      const apy = rateNum > 1 ? (rateNum - 1) * 100 : 0

      setData({
        snapshots: allSnapshots,
        portfolioData,
        activityData,
        rateData,
        totalReturns,
        totalVolume,
        tradeCount,
        apy,
        loading: false,
        stxlmBalance: stxlmNum,
        xlmBalance: xlmNum,
        exchangeRate: rateNum,
      })
    } catch {
      setData((prev) => ({ ...prev, loading: false }))
    }
  }, [address])

  useEffect(() => {
    const timer = setTimeout(refresh, 0)
    const interval = setInterval(refresh, 60000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [refresh, eventCount])

  return data
}
