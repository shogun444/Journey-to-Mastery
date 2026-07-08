"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"
import type { ActivityPoint } from "@/lib/analytics"

interface ActivityChartProps {
  data: ActivityPoint[]
  loading: boolean
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p
          key={p.name}
          className={`text-sm font-mono font-medium ${p.name === "Deposit" ? "text-emerald-400" : "text-blue-400"}`}
        >
          {p.name}: {p.value.toFixed(2)} XLM
        </p>
      ))}
    </div>
  )
}

export function ActivityChart({ data, loading }: ActivityChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
    >
      <Card className="p-5">
        <div className="mb-4">
          <Heading as="h3">Trading Activity</Heading>
          <p className="text-xs text-zinc-500 mt-0.5">Deposits and withdrawals over time</p>
        </div>

        {loading ? (
          <div className="h-48 bg-zinc-900/50 rounded-lg animate-pulse flex items-center justify-center">
            <p className="text-zinc-600 text-sm">Loading chart...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-48 bg-zinc-900/50 rounded-lg flex flex-col items-center justify-center gap-2">
            <p className="text-zinc-500 text-sm">No activity yet</p>
            <p className="text-zinc-600 text-xs">Start staking to see your trading history</p>
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#52525b", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#52525b", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v: number) => v.toFixed(1)}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                  wrapperStyle={{ background: "transparent", border: "none", outline: "none" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="deposit"
                  name="Deposit"
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                  animationDuration={600}
                />
                <Bar
                  dataKey="withdraw"
                  name="Withdraw"
                  fill="#3b82f6"
                  radius={[2, 2, 0, 0]}
                  animationDuration={600}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
