"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Badge } from "@/components/ui/badge"
import { STELLAR_EXPERT_URL } from "@/lib/stellar"

interface Tx {
  id: string
  type: "stake" | "unstake"
  amount: string
  asset: string
  timestamp: string
  hash: string
  status: "success"
}

const typeConfig = {
  stake: { label: "Stake", color: "text-emerald-400" as const, badge: "success" as const },
  unstake: { label: "Unstake", color: "text-blue-400" as const, badge: "default" as const },
}

function loadTxs(): Tx[] {
  try {
    return JSON.parse(localStorage.getItem("stxlm_txs") || "[]")
  } catch {
    return []
  }
}

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Tx[]>(loadTxs)

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = loadTxs()
      setTxs(stored)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Heading>Transactions</Heading>
        <p className="text-sm text-zinc-400 mt-1">Your staking transaction history</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        {txs.length > 0 ? (
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-zinc-800/50">
              {txs.map((tx) => {
                const cfg = typeConfig[tx.type]
                const timeAgo = getTimeAgo(tx.timestamp)
                const shortHash = tx.hash.slice(0, 7) + "..." + tx.hash.slice(-3)
                return (
                  <a
                    key={tx.id}
                    href={`${STELLAR_EXPERT_URL}/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-4 hover:bg-zinc-900 transition-colors gap-2 sm:gap-0"
                  >
                    <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                      <div>
                        <p className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{timeAgo}</p>
                      </div>
                      <span className="text-sm font-mono text-zinc-200 sm:hidden text-right">
                        {tx.amount} {tx.asset}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:gap-4">
                      <span className="text-sm font-mono text-zinc-200 hidden sm:inline">
                        {tx.amount} {tx.asset}
                      </span>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <Badge variant={cfg.badge}>{tx.status}</Badge>
                        <span className="text-xs font-mono text-zinc-500 text-right">{shortHash}</span>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-zinc-400">No transactions yet</p>
          </Card>
        )}
      </motion.div>
    </div>
  )
}

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
