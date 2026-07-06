"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatItem {
  label: string
  value: string
  monospace?: boolean
  accent?: boolean
}

interface StakeStatsProps {
  items: StatItem[]
  className?: string
}

export function StakeStats({ items, className }: StakeStatsProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", className)}>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <Card className="text-center p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{item.label}</p>
            <p
              className={cn(
                "text-lg font-semibold",
                item.monospace ? "font-mono" : "",
                item.accent ? "text-emerald-400" : "text-zinc-100",
              )}
            >
              {item.value}
            </p>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
