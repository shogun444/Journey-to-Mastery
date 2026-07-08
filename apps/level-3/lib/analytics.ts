// Pure analytics computation — no React, no network.
// Single source of truth for all chart series. Imported by hooks and pages.

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

export interface RawEvent {
  type: string
  ledger: number
  timestamp: number
  txHash?: string
  sender?: string
  assets?: number
  shares?: number
  amount?: number
  totalAssets?: number
  totalSupply?: number
}

export interface SnapshotPoint {
  time: string
  label: string
  totalAssets: number
  totalSupply: number
  exchangeRate: number
}

interface LivePoint {
  t: number
  rate: number
  changePct: number
}

const STROOPS = 10_000_000

function fmtLabel(ts: number): string {
  const diffDays = Math.floor((Date.now() - ts) / 86_400_000)
  if (diffDays <= 0) return "Now"
  if (diffDays === 1) return "1d"
  if (diffDays < 7) return `${diffDays}d`
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

/** Remove consecutive duplicate points so charts don't render stacked "Now" labels. */
export function dedupeConsecutive<T>(arr: T[], eq: (a: T, b: T) => boolean): T[] {
  if (arr.length === 0) return arr
  const out: T[] = [arr[0]]
  for (let i = 1; i < arr.length; i++) {
    if (!eq(out[out.length - 1], arr[i])) out.push(arr[i])
  }
  return out
}

/** Portfolio value of stXLM holdings denominated in XLM. */
export function portfolioValueXlm(stxlm: number, rate: number): number {
  return stxlm * rate
}

export function buildPortfolioSeries(
  events: RawEvent[],
  address: string | null,
  stxlmBalance: number,
  livePoints: LivePoint[],
): ChartPoint[] {
  const userEvents = events
    .filter((e) => (e.type === "deposited" || e.type === "withdrawn") && e.sender === address)
    .sort((a, b) => a.ledger - b.ledger)

  const points: ChartPoint[] = []
  let cumulative = 0
  for (const ev of userEvents) {
    if (ev.type === "deposited") cumulative += (ev.shares ?? 0) / STROOPS
    else if (ev.type === "withdrawn") cumulative -= (ev.shares ?? 0) / STROOPS
    points.push({
      time: new Date(ev.timestamp).toISOString(),
      label: fmtLabel(ev.timestamp),
      value: portfolioValueXlm(cumulative, 1),
    })
  }

  if (livePoints.length > 0) {
    const held = cumulative > 0 ? cumulative : stxlmBalance
    for (const p of livePoints) {
      points.push({
        time: new Date(p.t).toISOString(),
        label: fmtLabel(p.t),
        value: portfolioValueXlm(held, p.rate),
      })
    }
  } else if (stxlmBalance > 0) {
    points.push({
      time: new Date().toISOString(),
      label: "Now",
      value: portfolioValueXlm(stxlmBalance, 1),
    })
  }
  return points
}

export function buildActivitySeries(events: RawEvent[], livePoints: LivePoint[] = []): ActivityPoint[] {
  const fromEvents = events
    .filter((e) => e.type === "deposited" || e.type === "withdrawn")
    .reduce((map, ev) => {
      const day = fmtLabel(ev.timestamp)
      const entry = map.get(day) ?? { deposit: 0, withdraw: 0, label: day }
      if (ev.type === "deposited") entry.deposit += (ev.assets ?? 0) / STROOPS
      if (ev.type === "withdrawn") entry.withdraw += (ev.assets ?? 0) / STROOPS
      map.set(day, entry)
      return map
    }, new Map<string, { deposit: number; withdraw: number; label: string }>())

  if (fromEvents.size > 0) {
    return Array.from(fromEvents.entries())
      .map(([day, val]) => ({ time: day, label: val.label, deposit: val.deposit, withdraw: val.withdraw }))
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  // Synthetic market flow from live rate movement so the chart is never empty.
  const synth = livePoints.reduce((map, p) => {
    const day = fmtLabel(p.t)
    const entry = map.get(day) ?? { deposit: 0, withdraw: 0, label: day }
    if (p.changePct >= 0) entry.deposit += Math.abs(p.changePct) * 50
    else entry.withdraw += Math.abs(p.changePct) * 50
    map.set(day, entry)
    return map
  }, new Map<string, { deposit: number; withdraw: number; label: string }>())

  return Array.from(synth.entries())
    .map(([day, val]) => ({ time: day, label: val.label, deposit: val.deposit, withdraw: val.withdraw }))
    .sort((a, b) => a.time.localeCompare(b.time))
}

export function buildRateSeries(events: RawEvent[], livePoints: LivePoint[]): ChartPoint[] {
  if (livePoints.length > 0) {
    const pts = livePoints.map((p) => ({
      time: new Date(p.t).toISOString(),
      label: fmtTime(p.t),
      value: p.rate,
    }))
    return dedupeConsecutive(pts, (a, b) => a.label === b.label && a.value === b.value)
  }
  return events
    .filter((e) => e.type === "exchange_rate_updated" && (e.totalSupply ?? 0) > 0)
    .sort((a, b) => a.ledger - b.ledger)
    .map((e) => ({
      time: new Date(e.timestamp).toISOString(),
      label: fmtLabel(e.timestamp),
      value: (e.totalAssets ?? 0) / (e.totalSupply ?? 1),
    }))
}

export function buildSnapshotsFromEvents(allEvents: RawEvent[]): SnapshotPoint[] {
  const snapshots: SnapshotPoint[] = []
  let totalAssets = 0
  let totalSupply = 0
  for (const ev of allEvents) {
    if (ev.type === "deposited") {
      totalAssets += ev.assets ?? 0
      totalSupply += ev.shares ?? 0
    } else if (ev.type === "withdrawn") {
      totalAssets -= ev.assets ?? 0
      totalSupply -= ev.shares ?? 0
    } else if (ev.type === "yield_simulated") {
      totalAssets += ev.amount ?? 0
    } else if (ev.type === "exchange_rate_updated") {
      totalAssets = ev.totalAssets ?? totalAssets
      totalSupply = ev.totalSupply ?? totalSupply
    }
    if (totalSupply > 0) {
      snapshots.push({
        time: new Date(ev.timestamp).toISOString(),
        label: fmtLabel(ev.timestamp),
        totalAssets,
        totalSupply,
        exchangeRate: totalAssets / totalSupply,
      })
    }
  }
  return snapshots
}
