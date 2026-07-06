"use client"

import { motion } from "motion/react"
import { ArrowRight, CaretUp, CaretDown } from "@phosphor-icons/react"
import type { Order } from "@/types"
import { cn } from "@/lib/utils"

interface RateDisplayProps {
  bids: Order[]
  asks: Order[]
  loading: boolean
}

export function RateDisplay({ bids, asks, loading }: RateDisplayProps) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl bg-[var(--glass)] p-[1px] shadow-[var(--shadow-card)] ring-1 ring-[var(--glass-border)]">
        <div className="rounded-[calc(2rem-1px)] bg-gradient-to-b from-[var(--glass-gradient)] to-transparent p-4">
          <div className="mx-auto h-4 w-24 rounded-full bg-[var(--glass-hover)]" />
        </div>
      </div>
    )
  }

  const bestBid = bids[0]
  const bestAsk = asks[0]
  const spread = bestBid && bestAsk
    ? (((Number(bestAsk.price) - Number(bestBid.price)) / Number(bestAsk.price)) * 100).toFixed(2)
    : "—"

  const noLiquidity = bids.length === 0 && asks.length === 0

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="space-y-2"
    >
      {noLiquidity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-[var(--glass)] p-[1px] ring-1 ring-[var(--glass-border)]"
        >
          <div className="rounded-[calc(2rem-1px)] bg-gradient-to-b from-[var(--glass-gradient)] to-transparent px-4 py-3">
            <p className="text-xs text-zinc-500">No liquidity on orderbook &mdash; rate is estimated</p>
          </div>
        </motion.div>
      )}

      {!noLiquidity && (
        <div className="rounded-2xl bg-[var(--glass)] p-[1px] shadow-[var(--shadow-card)] ring-1 ring-[var(--glass-border)]">
          <div className="flex w-full items-center justify-between rounded-[calc(2rem-1px)] bg-gradient-to-b from-[var(--glass-gradient)] to-transparent px-4 py-2.5">
            <span className="text-xs text-zinc-500">Spread</span>
            <span className={cn(
              "font-mono text-xs",
              Number(spread) > 5 ? "text-red-400" : Number(spread) > 2 ? "text-amber-400" : "text-zinc-400"
            )}>
              {spread}%
              {Number(spread) > 2 && <CaretUp size={11} className="ml-0.5 inline text-red-400" />}
            </span>
          </div>
        </div>
      )}

      {bestBid && (
        <div className="rounded-2xl bg-[var(--glass)] p-[1px] shadow-[var(--shadow-card)] ring-1 ring-[var(--glass-border)]">
          <div className="rounded-[calc(2rem-1px)] bg-gradient-to-b from-[var(--glass-gradient)] to-transparent px-4 py-2.5">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">Orderbook Depth</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CaretDown size={10} className="text-red-400/70" />
                <span className="font-mono text-xs text-red-400/70">
                  {Number(bestBid.amount).toFixed(2)}
                </span>
              </div>
              <ArrowRight size={10} className="text-zinc-600" />
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs text-emerald-400/70">
                  {Number(bestAsk?.amount ?? 0).toFixed(2)}
                </span>
                <CaretUp size={10} className="text-emerald-400/70" />
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
