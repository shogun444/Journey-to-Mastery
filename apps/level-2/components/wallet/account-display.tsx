"use client"

import { motion } from "motion/react"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import { useBalance } from "@/hooks/useBalance"
import { Card } from "@/components/ui/card"
import { Copy, Check } from "@phosphor-icons/react"
import { useState } from "react"

export function AccountDisplay() {
  const { wallet } = useStellarWallet()
  const { balances, loading } = useBalance(wallet?.address ?? null)
  const [copied, setCopied] = useState(false)

  if (!wallet) return null

  const xlmBalance = balances["native"]
  const formattedBalance = xlmBalance ? Number(xlmBalance).toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0"

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
    >
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">Balance</p>
          <p className="font-mono text-sm text-zinc-300">
            {loading ? "..." : `${formattedBalance} XLM`}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">Address</p>
          <button
            onClick={copyAddress}
            className="flex items-center gap-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          </button>
        </div>
      </Card>
    </motion.div>
  )
}
