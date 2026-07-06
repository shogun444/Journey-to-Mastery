"use client"

import { type Order } from "@/types"
import { motion } from "motion/react"

interface OrderbookPanelProps {
  bids: Order[]
  asks: Order[]
  loading: boolean
}

export function OrderbookPanel({ bids, asks, loading }: OrderbookPanelProps) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl bg-[var(--glass)] p-[1px] shadow-[var(--shadow-card)] ring-1 ring-[var(--glass-border)]">
        <div className="space-y-3 rounded-[calc(2rem-1px)] bg-gradient-to-b from-[var(--glass-gradient)] to-transparent p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3.5 rounded-md bg-[var(--glass-hover)]" />
          ))}
        </div>
      </div>
    )
  }

  if (bids.length === 0 && asks.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-2xl bg-[var(--glass)] p-[1px] shadow-[var(--shadow-card)] ring-1 ring-[var(--glass-border)]"
    >
      <div className="rounded-[calc(2rem-1px)] bg-gradient-to-b from-[var(--glass-gradient)] to-transparent p-4">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">Orderbook</p>

        <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-zinc-600">
          <span>Price</span>
          <span>Amount</span>
          <span>Total</span>
        </div>

        <div className="space-y-0.5">
          {asks.slice(0, 6).reverse().map((ask) => (
            <div
              key={ask.id}
              className="group relative flex items-center justify-between overflow-hidden rounded-md px-1.5 py-0.5"
            >
              <div
                className="absolute inset-y-0 right-0 rounded-md bg-red-500/5 transition-all group-hover:bg-red-500/10"
                style={{ width: `${Math.min(Number(ask.amount) * 5, 100)}%` }}
              />
              <span className="relative font-mono text-xs text-red-400/80">{Number(ask.price).toFixed(7)}</span>
              <span className="relative font-mono text-xs text-zinc-500">{Number(ask.amount).toFixed(2)}</span>
              <span className="relative font-mono text-xs text-zinc-600">
                {(Number(ask.price) * Number(ask.amount)).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="my-2 border-t border-[var(--glass-border)]" />

        <div className="space-y-0.5">
          {bids.slice(0, 6).map((bid) => (
            <div
              key={bid.id}
              className="group relative flex items-center justify-between overflow-hidden rounded-md px-1.5 py-0.5"
            >
              <div
                className="absolute inset-y-0 right-0 rounded-md bg-emerald-500/5 transition-all group-hover:bg-emerald-500/10"
                style={{ width: `${Math.min(Number(bid.amount) * 5, 100)}%` }}
              />
              <span className="relative font-mono text-xs text-emerald-400/80">{Number(bid.price).toFixed(7)}</span>
              <span className="relative font-mono text-xs text-zinc-500">{Number(bid.amount).toFixed(2)}</span>
              <span className="relative font-mono text-xs text-zinc-600">
                {(Number(bid.price) * Number(bid.amount)).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
