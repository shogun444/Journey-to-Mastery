"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/tooltip"
import { Info } from "@phosphor-icons/react"

interface PreviewDisplayProps {
  label: string
  value: string
  tooltip?: string
  className?: string
}

export function PreviewDisplay({ label, value, tooltip, className }: PreviewDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800/30 border-dashed",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">{label}</span>
        {tooltip && (
          <Tooltip content={tooltip}>
            <Info size={14} className="text-zinc-500 cursor-help" />
          </Tooltip>
        )}
      </div>
      <span className="text-sm font-mono font-medium text-zinc-200">{value}</span>
    </motion.div>
  )
}
