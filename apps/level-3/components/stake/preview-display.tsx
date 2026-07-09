"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/tooltip"
import { Info } from "@phosphor-icons/react"

interface PreviewDisplayProps {
  label: string
  value: string
  tooltip?: string
  rate?: string
  rateTrend?: "up" | "down" | "neutral"
  slippage?: string
  fee?: string
  className?: string
}

export function PreviewDisplay({ label, value, tooltip, rate, rateTrend, slippage, fee, className }: PreviewDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg bg-zinc-900/50 border border-zinc-800/30 border-dashed p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-zinc-400">{label}</span>
        {tooltip && (
          <Tooltip content={tooltip}>
            <Info size={14} className="text-zinc-500 cursor-help" />
          </Tooltip>
        )}
      </div>

      <div className="text-xl font-mono font-semibold text-zinc-100 mb-1 leading-tight">
        {value}
      </div>

      {(rate || slippage || fee) && (
        <div className="mt-3 pt-3 border-t border-zinc-800/30 flex flex-col gap-1.5">
          {rate && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Live Rate</span>
              <span className={cn(
                "text-xs font-mono font-medium",
                rateTrend === "up" ? "text-emerald-400" : rateTrend === "down" ? "text-red-400" : "text-zinc-300",
              )}>{rate}</span>
            </div>
          )}
          {slippage && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Slippage</span>
              <span className="text-xs font-mono font-medium text-zinc-300">{slippage}</span>
            </div>
          )}
          {fee && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Fee</span>
              <span className="text-xs font-mono font-medium text-zinc-300">{fee}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
