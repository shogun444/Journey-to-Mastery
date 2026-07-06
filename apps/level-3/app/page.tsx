"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Subheading } from "@/components/ui/subheading"
import { Button } from "@/components/ui/button"
import { useBalance } from "@/hooks/useBalance"
import { useVault } from "@/hooks/useVault"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import {
  ArrowRight,
  Coins,
  ArrowUpRight,
  Wallet,
  TrendUp,
  Clock,
} from "@phosphor-icons/react"
import Link from "next/link"

export default function DashboardPage() {
  const { address } = useStellarWallet()
  const { xlmBalance, stXlmBalance } = useBalance(address)
  const { exchangeRate, loading: vaultLoading } = useVault()

  const xlmNum = Number(xlmBalance)
  const stxlmNum = Number(stXlmBalance)
  const rate = Number(exchangeRate)
  const stakedXlmValue = stxlmNum * rate
  const profitLoss = stakedXlmValue - stxlmNum
  const apy = rate > 1 ? ((rate - 1) * 100).toFixed(2) : "0.00"

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <Heading>Dashboard</Heading>
          <p className="text-sm text-zinc-400 mt-1">
            {address
              ? `Portfolio overview for ${address.slice(0, 4)}...${address.slice(-4)}`
              : "Connect your wallet to see your staking portfolio"}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Wallet size={20} className="text-blue-400" />
            </div>
            <div>
              <Subheading>XLM Balance</Subheading>
              <p className="text-2xl font-mono font-semibold text-zinc-100 mt-0.5">
                {xlmNum.toFixed(2)}{" "}
                <span className="text-sm text-zinc-500">XLM</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Coins size={20} className="text-emerald-400" />
            </div>
            <div>
              <Subheading>stXLM Balance</Subheading>
              <p className="text-2xl font-mono font-semibold text-emerald-400 mt-0.5">
                {stxlmNum.toFixed(2)}{" "}
                <span className="text-sm text-zinc-500">stXLM</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
              <TrendUp size={20} className="text-zinc-400" />
            </div>
            <div>
              <Subheading>Yield Earned</Subheading>
              <p className={`text-2xl font-mono font-semibold mt-0.5 ${profitLoss > 0 ? "text-emerald-400" : "text-zinc-500"}`}>
                {profitLoss > 0 ? "+" : ""}{profitLoss.toFixed(2)}{" "}
                <span className="text-sm text-zinc-500">XLM</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
              <ArrowUpRight size={20} className="text-zinc-400" />
            </div>
            <div>
              <Subheading>Exchange Rate</Subheading>
              <p className="text-2xl font-mono font-semibold text-zinc-100 mt-0.5">
                {vaultLoading ? "..." : rate.toFixed(4)}{" "}
                <span className="text-sm text-zinc-500">XLM/stXLM</span>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {stxlmNum > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="p-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Clock size={14} />
              <Subheading>Staked Value</Subheading>
            </div>
            <p className="text-xl font-mono font-semibold text-zinc-100">
              {stakedXlmValue.toFixed(2)} <span className="text-sm text-zinc-500">XLM</span>
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <TrendUp size={14} />
              <Subheading>APY</Subheading>
            </div>
            <p className="text-xl font-mono font-semibold text-emerald-400">
              {apy}%
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Coins size={14} />
              <Subheading>Total Staked</Subheading>
            </div>
            <p className="text-xl font-mono font-semibold text-zinc-100">
              {stxlmNum.toFixed(2)} <span className="text-sm text-zinc-500">stXLM</span>
            </p>
          </Card>
        </motion.div>
      )}

      {address ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Link href="/stake">
            <Card className="p-6 hover:bg-zinc-900 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <Heading as="h3">Stake XLM</Heading>
                <ArrowRight
                  size={20}
                  className="text-zinc-500 group-hover:text-zinc-300 transition-colors"
                />
              </div>
              <p className="text-sm text-zinc-400">Deposit XLM to receive stXLM and start earning yield</p>
              <Button variant="success" size="sm" className="mt-4">
                Stake
              </Button>
            </Card>
          </Link>

          <Link href="/unstake">
            <Card className="p-6 hover:bg-zinc-900 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <Heading as="h3">Unstake stXLM</Heading>
                <ArrowRight
                  size={20}
                  className="text-zinc-500 group-hover:text-zinc-300 transition-colors"
                />
              </div>
              <p className="text-sm text-zinc-400">Burn stXLM to withdraw XLM plus accrued yield</p>
              <Button variant="primary" size="sm" className="mt-4">
                Unstake
              </Button>
            </Card>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 text-center">
            <p className="text-zinc-400 mb-4">Connect your wallet to start staking XLM</p>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
