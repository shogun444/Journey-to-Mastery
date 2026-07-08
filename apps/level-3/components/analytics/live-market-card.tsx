"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useLiveMarket, type MarketPoint } from "@/hooks/useLiveMarket"
import { TrendUp, TrendDown } from "@phosphor-icons/react"

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="text-sm font-mono font-medium text-emerald-400">
        1 XLM = {payload[0].value.toFixed(7)} stXLM
      </p>
    </div>
  )
}

interface LiveMarketCardProps {
  baseRate?: number
  livePoints?: MarketPoint[]
  currentRate?: number
  lastChange?: number
}

export function LiveMarketCard({ baseRate = 1, livePoints: propPoints, currentRate: propRate, lastChange: propChange }: LiveMarketCardProps) {
  const internal = useLiveMarket({ baseRate })
  const points = propPoints ?? internal.points
  const currentRate = propRate ?? internal.currentRate
  const lastChange = propChange ?? internal.lastChange
  const isUp = lastChange >= 0
  const color = isUp ? "#10b981" : "#ef4444"
  const changeStr = `${isUp ? "+" : ""}${lastChange.toFixed(2)}%`

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <Heading as="h3">Live Market Rate</Heading>
            <p className="text-xs text-zinc-500 mt-0.5">stXLM / XLM — updates every few seconds</p>
          </div>
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-mono font-semibold ${
              isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            }`}
          >
            {isUp ? <TrendUp size={14} /> : <TrendDown size={14} />}
            {changeStr}
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-2 mb-3">
          <p className="text-3xl font-mono font-bold text-zinc-100">
            1 XLM = {currentRate.toFixed(7)}
          </p>
          <span className="text-sm text-zinc-500">stXLM</span>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
              <defs>
                <linearGradient id="liveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="t" hide />
              <YAxis
                domain={["dataMin - 0.0005", "dataMax + 0.0005"]}
                tick={{ fill: "#52525b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v: number) => v.toFixed(4)}
              />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ background: "transparent", border: "none", outline: "none" }} />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={color}
                strokeWidth={2}
                fill="url(#liveGradient)"
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  )
}
