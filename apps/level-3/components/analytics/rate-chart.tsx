"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import type { ChartPoint } from "@/lib/analytics"

interface RateChartProps {
  data: ChartPoint[]
  currentRate: number
  loading: boolean
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="text-sm font-mono font-medium text-emerald-400">
        1 stXLM = {payload[0].value.toFixed(7)} XLM
      </p>
    </div>
  )
}

export function RateChart({ data, currentRate, loading }: RateChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.24 }}
    >
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Heading as="h3">Exchange Rate History</Heading>
            <p className="text-xs text-zinc-500 mt-0.5">stXLM to XLM conversion rate</p>
          </div>
          <p className="text-lg font-mono font-semibold text-zinc-100">
            {currentRate.toFixed(7)}{" "}
            <span className="text-xs text-zinc-500">XLM/stXLM</span>
          </p>
        </div>

        {loading ? (
          <div className="h-40 bg-zinc-900/50 rounded-lg animate-pulse flex items-center justify-center">
            <p className="text-zinc-600 text-sm">Loading chart...</p>
          </div>
        ) : data.length < 2 ? (
          <div className="h-40 bg-zinc-900/50 rounded-lg flex flex-col items-center justify-center gap-2">
            <p className="text-zinc-500 text-sm">Collecting rate data...</p>
            <p className="text-zinc-600 text-xs">Rate history will appear as data accumulates</p>
          </div>
        ) : (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
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
                  width={56}
                  domain={["dataMin - 0.0001", "dataMax + 0.0001"]}
                  tickFormatter={(v: number) => v.toFixed(4)}
                />
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ background: "transparent", border: "none", outline: "none" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#10b981" }}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
