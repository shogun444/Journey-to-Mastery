"use client"

import { useState, useMemo, useRef, useCallback } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import type { Token } from "@/types"

interface PriceChartProps {
  token: Token
}

type Range = "24h" | "7d" | "30d"

const RANGES: Range[] = ["24h", "7d", "30d"]

const CHART_PADDING = { top: 10, right: 10, bottom: 20, left: 10 } as const

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generatePriceData(basePrice: number, points: number, volatility: number, seed: number) {
  const rand = seededRandom(seed)
  const data: number[] = []
  let price = basePrice
  for (let i = 0; i < points; i++) {
    const change = (rand() - 0.48) * volatility * price
    price = Math.max(price + change, basePrice * 0.1)
    data.push(price)
  }
  return data
}

const USD_TO_INR = 83

function formatPrice(val: number): string {
  if (val >= 1) return val.toFixed(4)
  if (val >= 0.01) return val.toFixed(6)
  return val.toFixed(8)
}

function formatINR(val: number): string {
  if (val >= 10000) return "₹" + (val / 1000).toFixed(1) + "K"
  if (val >= 100) return "₹" + val.toFixed(2)
  if (val >= 1) return "₹" + val.toFixed(2)
  return "₹" + val.toFixed(4)
}

export function PriceChart({ token }: PriceChartProps) {
  const [range, setRange] = useState<Range>("24h")
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const basePrice = token.code === "XLM" ? 0.12 : token.code === "USDC" ? 1.0 : 0.008
  const tokenSeed = hashCode(token.code)

  const config = useMemo(() => {
    const pt = range === "24h" ? 24 : range === "7d" ? 7 : 30
    const vol = range === "24h" ? 0.04 : range === "7d" ? 0.08 : 0.12
    const seed = tokenSeed + (range === "24h" ? 0 : range === "7d" ? 1 : 2)
    return { points: pt, volatility: vol, seed }
  }, [range, tokenSeed])

  const { data, change, changePercent, high, low } = useMemo(() => {
    const d = generatePriceData(basePrice, config.points, config.volatility, config.seed)
    const first = d[0]!
    const last = d[d.length - 1]!
    const c = last - first
    const cp = ((last - first) / first) * 100
    const h = Math.max(...d)
    const l = Math.min(...d)
    return { data: d, change: c, changePercent: cp, high: h, low: l }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.points, config.volatility, config.seed])

  const isUp = change >= 0
  const color = isUp ? "rgb(52,211,153)" : "rgb(248,113,113)"
  const currentPrice = hoverIndex !== null ? data[hoverIndex]! : data[data.length - 1]!

  const motionPrice = useMotionValue(currentPrice)
  const springPrice = useSpring(motionPrice, { stiffness: 80, damping: 25 })
  const displayPrice = useTransform(springPrice, (v) => formatPrice(v))
  const displayPriceINR = useTransform(springPrice, (v) => formatINR(v * USD_TO_INR))

  const prevPriceRef = useRef(currentPrice)
  if (currentPrice !== prevPriceRef.current) {
    motionPrice.set(currentPrice)
    prevPriceRef.current = currentPrice
  }

  const chartWidth = 400 - CHART_PADDING.left - CHART_PADDING.right
  const chartHeight = 120 - CHART_PADDING.top - CHART_PADDING.bottom
  const minVal = Math.min(...data)
  const maxVal = Math.max(...data)
  const valRange = maxVal - minVal || 1

  const pathD = data
    .map((val, i) => {
      const x = CHART_PADDING.left + (i / (data.length - 1)) * chartWidth
      const y = CHART_PADDING.top + chartHeight - ((val - minVal) / valRange) * chartHeight
      return `${i === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")

  const areaPath = `${pathD} L ${CHART_PADDING.left + chartWidth} ${CHART_PADDING.top + chartHeight} L ${CHART_PADDING.left} ${CHART_PADDING.top + chartHeight} Z`

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || data.length < 2) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const relX = x - CHART_PADDING.left
    const fraction = relX / (rect.width - CHART_PADDING.left - CHART_PADDING.right)
    const idx = Math.round(fraction * (data.length - 1))
    const clamped = Math.max(0, Math.min(data.length - 1, idx))
    setHoverIndex(clamped)
  }, [data.length])

  const handleMouseLeave = useCallback(() => {
    setHoverIndex(null)
  }, [])

  const displayedChange = hoverIndex !== null
    ? data[hoverIndex]! - data[0]!
    : change
  const displayedChangePercent = hoverIndex !== null
    ? ((data[hoverIndex]! - data[0]!) / data[0]!) * 100
    : changePercent
  const displayIsUp = displayedChange >= 0

  return (
    <div className="rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{token.icon ?? "⟐"}</span>
          <div>
            <span className="font-semibold text-[var(--color-text-primary)]">{token.code}</span>
            <p className="text-[11px] text-[var(--color-text-secondary)]">{token.name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-4xl font-semibold text-[var(--color-text-primary)]">
            <motion.span>{displayPriceINR}</motion.span>
          </div>
          <div className={`mt-1 font-mono text-base ${displayIsUp ? "text-emerald-400" : "text-red-400"}`}>
            <motion.span
              key={`${displayIsUp ? "up" : "down"}-${displayedChangePercent.toFixed(2)}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              {displayIsUp ? "+" : ""}
              {displayedChangePercent.toFixed(2)}%
            </motion.span>
          </div>
          <div className="mt-0.5 font-mono text-sm text-[var(--color-text-secondary)]">
            <motion.span>{displayPrice}</motion.span>
          </div>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 400 120"
        className="w-full cursor-crosshair"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id={`gradient-${token.code}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#gradient-${token.code})`} />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {hoverIndex !== null && data.length > 0 && (
          <>
          <line
            x1={CHART_PADDING.left + (hoverIndex / (data.length - 1)) * chartWidth}
            y1={CHART_PADDING.top}
            x2={CHART_PADDING.left + (hoverIndex / (data.length - 1)) * chartWidth}
            y2={CHART_PADDING.top + chartHeight}
              stroke={color}
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.5"
            />
            <circle
              cx={CHART_PADDING.left + (hoverIndex / (data.length - 1)) * chartWidth}
              cy={CHART_PADDING.top + chartHeight - ((data[hoverIndex]! - minVal) / valRange) * chartHeight}
              r="4"
              fill={color}
              stroke="var(--color-surface-elevated)"
              strokeWidth="2"
            />
          </>
        )}
        {hoverIndex === null && data.length > 0 && (
          <circle
            cx={CHART_PADDING.left + chartWidth}
            cy={CHART_PADDING.top + chartHeight - ((data[data.length - 1]! - minVal) / valRange) * chartHeight}
            r="3"
            fill={color}
          />
        )}
      </svg>

      <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-4">
          <span>H: {formatPrice(high)}</span>
          <span>L: {formatPrice(low)}</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-[var(--color-surface)] p-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                range === r
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
