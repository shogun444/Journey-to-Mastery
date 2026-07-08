"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import type { ChartPoint } from "@/hooks/useAnalytics"

interface PortfolioChartProps {
  data: ChartPoint[]
  stxlmBalance: number
  exchangeRate: number
  loading: boolean
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="text-sm font-mono font-medium text-emerald-400">
        {payload[0].value.toFixed(2)} stXLM
      </p>
    </div>
  )
}

export function PortfolioChart({ data, stxlmBalance, exchangeRate, loading }: PortfolioChartProps) {
  const stakedValue = stxlmBalance * exchangeRate

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
    >
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Heading as="h3">Portfolio Performance</Heading>
            <p className="text-xs text-zinc-500 mt-0.5">stXLM balance over time</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-mono font-semibold text-zinc-100">
              {stxlmBalance.toFixed(2)} <span className="text-xs text-zinc-500">stXLM</span>
            </p>
            <p className="text-xs font-mono text-zinc-500">
              {stakedValue.toFixed(2)} XLM @ {exchangeRate.toFixed(4)}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-zinc-900/50 rounded-lg animate-pulse flex items-center justify-center">
            <p className="text-zinc-600 text-sm">Loading chart...</p>
          </div>
        ) : data.length < 2 ? (
          <div className="h-64 bg-zinc-900/50 rounded-lg flex flex-col items-center justify-center gap-2">
            <p className="text-zinc-500 text-sm">Not enough data yet</p>
            <p className="text-zinc-600 text-xs">Keep staking to build your performance history</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#52525b", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#52525b", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v: number) => v.toFixed(1)}
                />
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ background: "transparent", border: "none", outline: "none" }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#portfolioGradient)"
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
