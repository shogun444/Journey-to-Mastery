"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { getRpc, VAULT_CONTRACT_ID } from "@/lib/stellar"
import * as StellarSdk from "@stellar/stellar-sdk"
import { getExchangeRate, getUserBalance, getVaultState } from "@/lib/vault"
import { getHorizon } from "@/lib/stellar"
import { useLiveMarket } from "@/hooks/useLiveMarket"
import {
  buildPortfolioSeries,
  buildActivitySeries,
  buildRateSeries,
  type RawEvent,
  type ChartPoint,
  type ActivityPoint,
} from "@/lib/analytics"

export type { ChartPoint, ActivityPoint }

const EVENTS_KEY = "stxlm_vault_events_v2"

function loadCachedEvents(): RawEvent[] {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]")
  } catch {
    return []
  }
}

function saveCachedEvents(events: RawEvent[]) {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-500)))
  } catch {
    // silent
  }
}

function parseEvent(raw: Record<string, unknown>): RawEvent | null {
  try {
    const topicVal = (raw.topic as StellarSdk.xdr.ScVal[])?.[0]
    if (!topicVal) return null
    const eventType = String(StellarSdk.scValToNative(topicVal)).toLowerCase()
    const val = raw.value as StellarSdk.xdr.ScVal
    const value = StellarSdk.scValToNative(val) as Record<string, unknown>

    const base = {
      ledger: (raw.ledger as number) || 0,
      timestamp: new Date((raw.ledgerClosedAt as string) || Date.now()).getTime(),
      txHash: (raw.txHash as string) || "",
    }

    switch (eventType) {
      case "deposited": {
        const sender = String((value as Record<string, string>).sender ?? (Array.isArray(value) ? value[0] : ""))
        const assets = Number((value as Record<string, unknown>).assets ?? (Array.isArray(value) ? Number(value[1]) : 0))
        const shares = Number((value as Record<string, unknown>).shares ?? (Array.isArray(value) ? Number(value[2]) : 0))
        return { ...base, type: "deposited", sender, assets, shares }
      }
      case "withdrawn": {
        const sender = String((value as Record<string, string>).sender ?? (Array.isArray(value) ? value[0] : ""))
        const shares = Number((value as Record<string, unknown>).shares ?? (Array.isArray(value) ? Number(value[1]) : 0))
        const assets = Number((value as Record<string, unknown>).assets ?? (Array.isArray(value) ? Number(value[2]) : 0))
        return { ...base, type: "withdrawn", sender, shares, assets }
      }
      case "yield_simulated": {
        const amount = Number((value as Record<string, unknown>).amount ?? (Array.isArray(value) ? Number(value[0]) : value))
        return { ...base, type: "yield_simulated", amount }
      }
      case "exchange_rate_updated": {
        const newRateD0 = Number((value as Record<string, unknown>).new_rate_d0 ?? (Array.isArray(value) ? Number(value[2]) : 0))
        const newRateD1 = Number((value as Record<string, unknown>).new_rate_d1 ?? (Array.isArray(value) ? Number(value[3]) : 0))
        return { ...base, type: "exchange_rate_updated", totalAssets: newRateD0, totalSupply: newRateD1 }
      }
      default:
        return null
    }
  } catch {
    return null
  }
}

async function fetchAllVaultEvents(): Promise<RawEvent[]> {
  const events: RawEvent[] = []
  let cursor: string | undefined
  const maxPages = 5

  let startLedger: number | undefined
  try {
    const latest = await getRpc().getLatestLedger()
    startLedger = Math.max(1, latest.sequence - 10000)
  } catch {
    startLedger = undefined
  }

  for (let page = 0; page < maxPages; page++) {
    try {
      const opts: Record<string, unknown> = {
        filters: [{ type: "contract", contractIds: [VAULT_CONTRACT_ID] }],
        pagination: { limit: 100 },
      }
      if (cursor) {
        opts.pagination = { ...(opts.pagination as object), cursor }
      } else if (startLedger) {
        opts.startLedger = startLedger
      }

      const pageEvents = await getRpc().getEvents(opts as never)
      if (!pageEvents.events?.length) break

      for (const e of pageEvents.events) {
        const parsed = parseEvent(e as unknown as Record<string, unknown>)
        if (parsed) events.push(parsed)
      }

      cursor = pageEvents.cursor
      if (!cursor) break
    } catch {
      break
    }
  }

  return events.sort((a, b) => a.ledger - b.ledger)
}

interface RawState {
  events: RawEvent[]
  stxlmBalance: number
  xlmBalance: number
  exchangeRate: number
  tvl: number
  protocolTotalSupply: number
  totalStakers: number
  todaysYield: number
  loading: boolean
}

interface AnalyticsData {
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
  tvl: number
  protocolTotalSupply: number
  totalStakers: number
  protocolRevenue: number
  todaysYield: number
  currentRate: number
  lastChange: number
  livePoints: { t: number; rate: number; changePct: number }[]
}

export function useAnalytics(address: string | null, eventCount?: number) {
  const [raw, setRaw] = useState<RawState>({
    events: [],
    stxlmBalance: 0,
    xlmBalance: 0,
    exchangeRate: 1,
    tvl: 0,
    protocolTotalSupply: 0,
    totalStakers: 0,
    todaysYield: 0,
    loading: true,
  })

  const { points: livePoints, currentRate, lastChange } = useLiveMarket({ baseRate: raw.exchangeRate || 1 })

  const refresh = useCallback(async () => {
    if (!address) {
      setRaw((prev) => ({ ...prev, loading: false }))
      return
    }

    try {
      const cached = loadCachedEvents()
      const vaultEvents = cached.length > 0 ? cached : await fetchAllVaultEvents()
      if (cached.length === 0 && vaultEvents.length > 0) {
        saveCachedEvents(vaultEvents)
      }

      const [currentRateRpc, currentUserBalance, vaultState, account] = await Promise.all([
        getExchangeRate(address),
        getUserBalance(address),
        getVaultState(address),
        getHorizon().loadAccount(address),
      ])

      const rateNum = Number(currentRateRpc) || 1
      const stxlmNum = Number(currentUserBalance ?? "0")
      const tvlNum = Number(vaultState.totalAssets) / 10_000_000
      const xlmNum = Number(
        account.balances.find((b: { asset_type: string }) => b.asset_type === "native")?.balance ?? "0"
      )

      const uniqueStakers = new Set(
        vaultEvents.filter((ev) => ev.type === "deposited").map((ev) => ev.sender)
      )

      const todayStart = Date.now() - 86_400_000
      const todaysYield =
        vaultEvents
          .filter((ev) => ev.type === "yield_simulated" && ev.timestamp > todayStart)
          .reduce((s, ev) => s + (ev.amount ?? 0), 0) / 10_000_000

      setRaw({
        events: vaultEvents,
        stxlmBalance: stxlmNum,
        xlmBalance: xlmNum,
        exchangeRate: rateNum,
        tvl: tvlNum,
        protocolTotalSupply: Number(vaultState.totalSupply) / 10_000_000,
        totalStakers: uniqueStakers.size,
        todaysYield,
        loading: false,
      })
    } catch {
      setRaw((prev) => ({ ...prev, loading: false }))
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

  const portfolioData = useMemo(
    () => buildPortfolioSeries(raw.events, address, raw.stxlmBalance, livePoints),
    [raw.events, raw.stxlmBalance, livePoints, address]
  )
  const activityData = useMemo(
    () => buildActivitySeries(raw.events, livePoints),
    [raw.events, livePoints]
  )
  const rateData = useMemo(
    () => buildRateSeries(raw.events, livePoints),
    [raw.events, livePoints]
  )

  const stxlmNum = raw.stxlmBalance
  const effectiveRate = currentRate || raw.exchangeRate || 1
  const totalReturns = stxlmNum * effectiveRate - stxlmNum
  const apy = effectiveRate > 1 ? (effectiveRate - 1) * 100 : 0
  const totalVolume =
    raw.events.filter((ev) => ev.type === "deposited").reduce((s, ev) => s + (ev.assets ?? 0), 0) /
    10_000_000
  const tradeCount = raw.events.filter(
    (ev) => ev.type === "deposited" || ev.type === "withdrawn"
  ).length

  const data: AnalyticsData = {
    portfolioData,
    activityData,
    rateData,
    totalReturns,
    totalVolume,
    tradeCount,
    apy,
    loading: raw.loading,
    stxlmBalance: stxlmNum,
    xlmBalance: raw.xlmBalance,
    exchangeRate: effectiveRate,
    tvl: raw.tvl,
    protocolTotalSupply: raw.protocolTotalSupply,
    totalStakers: raw.totalStakers,
    protocolRevenue: 0,
    todaysYield: raw.todaysYield,
    currentRate,
    lastChange,
    livePoints,
  }

  return data
}
