"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Badge } from "@/components/ui/badge"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import { useSorobanEvents } from "@/hooks/useSorobanEvents"
import { getHorizon, STELLAR_EXPERT_URL } from "@/lib/stellar"

interface Tx {
  id: string
  type: "stake" | "unstake" | "yield" | "fee"
  amount: string
  asset: string
  timestamp: string
  hash: string
  status: "success" | "failed" | "pending"
}

const typeConfig: Record<string, { label: string; color: string; badge: "success" | "default" | "error" | "warning" }> = {
  stake: { label: "Stake", color: "text-emerald-400", badge: "success" },
  unstake: { label: "Unstake", color: "text-blue-400", badge: "default" },
  yield: { label: "Yield", color: "text-amber-400", badge: "warning" },
  fee: { label: "Fee", color: "text-red-400", badge: "error" },
}

function loadLocalTxs(): Tx[] {
  try {
    return JSON.parse(localStorage.getItem("stxlm_txs") || "[]")
  } catch {
    return []
  }
}

async function fetchHorizonTxs(address: string): Promise<Tx[]> {
  try {
    const horizon = getHorizon()
    const ops = await horizon
      .operations()
      .forAccount(address)
      .limit(50)
      .order("desc")
      .call()

    const txs: Tx[] = []
    for (const op of ops.records) {
      if (op.type === "invoke_host_function") {
        const opRecord = op as unknown as Record<string, unknown>
        const func = opRecord.function ?? ""
        const funcStr = String(func)
        const txHash = opRecord.transaction_hash as string
        const createdAt = opRecord.created_at as string

        if (funcStr.includes("deposit")) {
          txs.push({
            id: op.id,
            type: "stake",
            amount: "—",
            asset: "XLM",
            timestamp: createdAt,
            hash: txHash,
            status: opRecord.transaction_successful ? "success" : "failed",
          })
        } else if (funcStr.includes("withdraw")) {
          txs.push({
            id: op.id,
            type: "unstake",
            amount: "—",
            asset: "stXLM",
            timestamp: createdAt,
            hash: txHash,
            status: opRecord.transaction_successful ? "success" : "failed",
          })
        } else if (funcStr.includes("simulate_yield")) {
          txs.push({
            id: op.id,
            type: "yield",
            amount: "—",
            asset: "XLM",
            timestamp: createdAt,
            hash: txHash,
            status: opRecord.transaction_successful ? "success" : "failed",
          })
        }
      }
    }
    return txs
  } catch {
    return []
  }
}

export default function TransactionsPage() {
  const { address } = useStellarWallet()
  const { eventCount } = useSorobanEvents(address)
  const [txs, setTxs] = useState<Tx[]>(() => {
    if (typeof window !== "undefined") return loadLocalTxs()
    return []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!address) {
        if (!cancelled) {
          setTxs(loadLocalTxs())
          setLoading(false)
        }
        return
      }

      if (!cancelled) setLoading(true)
      const [localTxs, horizonTxs] = await Promise.all([
        Promise.resolve(loadLocalTxs()),
        fetchHorizonTxs(address),
      ])

      if (cancelled) return

      const seen = new Set<string>()
      const merged: Tx[] = []

      for (const tx of horizonTxs) {
        if (!seen.has(tx.hash)) {
          seen.add(tx.hash)
          merged.push(tx)
        }
      }
      for (const tx of localTxs) {
        if (!seen.has(tx.hash)) {
          seen.add(tx.hash)
          merged.push(tx)
        }
      }

      merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setTxs(merged)
      setLoading(false)
    }

    load()
    const interval = setInterval(load, 15000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [address, eventCount])

  return (
    <div className="flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Heading>Transactions</Heading>
        <p className="text-sm text-zinc-400 mt-1">
          {address ? "Your staking transaction history from the network" : "Connect your wallet to see your transaction history"}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-zinc-400 animate-pulse">Loading transactions...</p>
          </Card>
        ) : txs.length > 0 ? (
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-zinc-800/50">
              {txs.map((tx) => {
                const cfg = typeConfig[tx.type] || typeConfig.stake
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
            <p className="text-zinc-600 text-sm mt-1">Start staking to see your history</p>
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
