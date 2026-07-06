"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Subheading } from "@/components/ui/subheading"
import { useVault } from "@/hooks/useVault"

export default function AnalyticsPage() {
  const { vaultState, exchangeRate } = useVault()

  const totalAssets = (Number(vaultState.totalAssets) / 10_000_000).toFixed(2)
  const totalSupply = (Number(vaultState.totalSupply) / 10_000_000).toFixed(2)
  const rate = Number(exchangeRate)
  const apy = rate > 1 ? ((rate - 1) * 100).toFixed(2) : "0.00"

  const metrics = [
    { label: "Total Value Locked", value: `${totalAssets} XLM`, desc: "Total XLM deposited in the vault" },
    { label: "Current APY", value: `${apy}%`, desc: "Annualized yield rate", accent: true },
    { label: "Total Supply", value: `${totalSupply} stXLM`, desc: "Total stXLM tokens minted" },
    { label: "Exchange Rate", value: rate.toFixed(4), desc: "1 stXLM equals this much XLM", monospace: true },
    { label: "Deposit Fee", value: `${vaultState.depositFeeBps / 100}%`, desc: "Current deposit fee" },
    { label: "Withdraw Fee", value: `${vaultState.withdrawFeeBps / 100}%`, desc: "Current withdraw fee" },
    { label: "Paused", value: vaultState.paused ? "Yes" : "No", desc: "Vault operational status" },
    { label: "TVL Change", value: "—", desc: "Tracked over time once volume accumulates" },
  ]

  return (
    <div className="flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Heading>Analytics</Heading>
        <p className="text-sm text-zinc-400 mt-1">stXLM protocol metrics and performance data</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
      >
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.03 }}
          >
            <Card className="p-4">
              <Subheading>{metric.label}</Subheading>
              <p
                className={`text-xl font-semibold mt-1.5 ${
                  metric.accent ? "text-emerald-400" : "text-zinc-100"
                } ${metric.monospace ? "font-mono" : ""}`}
              >
                {metric.value}
              </p>
              <p className="text-xs text-zinc-500 mt-1">{metric.desc}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="p-6">
          <Heading as="h3">About stXLM Analytics</Heading>
          <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-400">
            <p>
              This protocol uses a <strong className="text-zinc-200">mock yield source</strong> on testnet because
              testnet assets do not generate real staking yield.
            </p>
            <p>
              The vault is designed with a <strong className="text-zinc-200">yield adapter interface</strong> so
              production strategies (e.g., Blend Protocol lending, DEX liquidity) can be integrated without changing
              the vault contract.
            </p>
            <p>
              On mainnet, the yield source would be replaced with a real strategy such as lending on Blend Protocol,
              providing liquidity on Soroswap, or other DeFi protocols.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
