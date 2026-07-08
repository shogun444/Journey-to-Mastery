"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Subheading } from "@/components/ui/subheading"
import { TrendUp, Coins, Clock, ArrowUpRight } from "@phosphor-icons/react"

interface AnalyticsStatsProps {
  totalReturns: number
  totalVolume: number
  tradeCount: number
  apy: number
  loading: boolean
}

export function AnalyticsStats({ totalReturns, totalVolume, tradeCount, apy, loading }: AnalyticsStatsProps) {
  const stats = [
    {
      label: "Total Returns",
      value: `${totalReturns >= 0 ? "+" : ""}${totalReturns.toFixed(4)} XLM`,
      accent: totalReturns >= 0,
      icon: TrendUp,
      desc: totalReturns >= 0 ? "Profit earned" : "Loss",
    },
    {
      label: "Total Volume",
      value: `${totalVolume.toFixed(2)} XLM`,
      accent: false,
      icon: Coins,
      desc: "All-time deposits",
    },
    {
      label: "Trades",
      value: String(tradeCount),
      accent: false,
      icon: Clock,
      desc: "Total transactions",
    },
    {
      label: "Current APY",
      value: `${apy.toFixed(2)}%`,
      accent: apy > 0,
      icon: ArrowUpRight,
      desc: "Annualized yield rate",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Subheading>{stat.label}</Subheading>
                <Icon size={16} className="text-zinc-500" />
              </div>
              <p
                className={`text-xl font-semibold font-mono ${
                  stat.accent ? "text-emerald-400" : "text-zinc-100"
                } ${loading ? "animate-pulse opacity-40" : ""}`}
              >
                {loading ? "—" : stat.value}
              </p>
              <p className="text-xs text-zinc-500 mt-1">{stat.desc}</p>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
