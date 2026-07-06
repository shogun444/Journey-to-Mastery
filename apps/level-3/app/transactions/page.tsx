"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Badge } from "@/components/ui/badge"

const sampleTxs = [
  { id: "1", type: "stake" as const, amount: "1000", asset: "XLM", status: "success" as const, hash: "abc...def", time: "2m ago" },
  { id: "2", type: "unstake" as const, amount: "500", asset: "stXLM", status: "success" as const, hash: "def...ghi", time: "15m ago" },
  { id: "3", type: "yield" as const, amount: "2.5", asset: "XLM", status: "success" as const, hash: "ghi...jkl", time: "1h ago" },
]

const typeConfig = {
  stake: { label: "Stake", color: "text-emerald-400" as const, badge: "success" as const },
  unstake: { label: "Unstake", color: "text-blue-400" as const, badge: "default" as const },
  yield: { label: "Yield", color: "text-amber-400" as const, badge: "warning" as const },
  fee: { label: "Fee", color: "text-zinc-400" as const, badge: "default" as const },
}

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Heading>Transactions</Heading>
        <p className="text-sm text-zinc-400 mt-1">Your staking transaction history</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        {sampleTxs.length > 0 ? (
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-zinc-800/50">
              {sampleTxs.map((tx) => {
                const cfg = typeConfig[tx.type]
                return (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{tx.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-zinc-200">
                        {tx.amount} {tx.asset}
                      </span>
                      <Badge variant={cfg.badge}>{tx.status}</Badge>
                      <span className="text-xs font-mono text-zinc-500 w-20 text-right">{tx.hash}</span>
                    </div>
                  </div>
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
