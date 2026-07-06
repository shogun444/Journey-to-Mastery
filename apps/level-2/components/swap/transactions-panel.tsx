"use client"

import { motion } from "motion/react"
import { ArrowRight, ArrowBendUpRight, ArrowsDownUp, CheckCircle, XCircle, Spinner } from "@phosphor-icons/react"
import { getStellarExpertUrl } from "@/lib/transactions"
import type { Transaction } from "@/types"

interface TransactionsPanelProps {
  transactions: Transaction[]
  loading: boolean
  address: string | null
}

function formatTimeAgo(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  const diffSecs = Math.floor(diffMs / 1000)

  if (diffSecs < 60) return `${diffSecs}s ago`
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function formatAddress(addr: string): string {
  if (addr.length < 12) return addr
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

function getTxIcon(type: Transaction["type"]) {
  switch (type) {
    case "send":
      return <ArrowBendUpRight size={14} className="text-red-400" />
    case "receive":
      return <ArrowBendUpRight size={14} className="text-emerald-400" />
    case "swap":
      return <ArrowsDownUp size={14} className="text-blue-400" />
  }
}

function getTxLabel(type: Transaction["type"]) {
  switch (type) {
    case "send":
      return "Send"
    case "receive":
      return "Receive"
    case "swap":
      return "Swap"
  }
}

function getAmountColor(type: Transaction["type"]) {
  switch (type) {
    case "send":
      return "text-red-400"
    case "receive":
      return "text-emerald-400"
    case "swap":
      return "text-blue-400"
  }
}

export function TransactionsPanel({ transactions, loading, address }: TransactionsPanelProps) {
  return (
    <div className="flex h-[80vh] flex-col rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <p className="text-sm font-medium text-zinc-400">
          Transactions
        </p>
        <span className="text-[11px] text-[var(--color-text-muted)]">
          {loading ? (
            <Spinner size={12} className="animate-spin" />
          ) : transactions.length > 0 ? (
            `${transactions.length} recent`
          ) : (
            ""
          )}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!address ? (
          <div className="flex h-full items-center justify-center px-5">
            <p className="text-xs text-[var(--color-text-muted)]">Connect wallet to see transactions</p>
          </div>
        ) : loading && transactions.length === 0 ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-[var(--color-surface-hover)]" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex h-full items-center justify-center px-5">
            <p className="text-xs text-[var(--color-text-muted)]">No recent transactions</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {transactions.map((tx) => (
              <motion.a
                key={tx.id}
                href={getStellarExpertUrl(tx.hash)}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface)]">
                  {getTxIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--color-text-primary)]">
                      {getTxLabel(tx.type)}
                    </span>
                    {tx.status === "success" ? (
                      <CheckCircle size={10} className="text-emerald-500" weight="fill" />
                    ) : (
                      <XCircle size={10} className="text-red-500" weight="fill" />
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-muted)]">
                    {tx.type === "swap" ? `${tx.amount} ${tx.asset}` : `${formatAddress(tx.counterparty)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-mono ${getAmountColor(tx.type)}`}>
                    {tx.type === "receive" ? "+" : tx.type === "send" ? "-" : "↔"}
                    {Number(tx.amount).toLocaleString(undefined, { maximumFractionDigits: 4 })} {tx.asset}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                    {formatTimeAgo(tx.timestamp)}
                  </p>
                </div>
                <ArrowRight size={10} className="shrink-0 text-[var(--color-text-muted)]" />
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
