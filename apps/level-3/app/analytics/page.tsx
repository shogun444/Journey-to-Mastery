"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import { useAnalytics } from "@/hooks/useAnalytics"
import { useSorobanEvents } from "@/hooks/useSorobanEvents"
import { AnalyticsStats } from "@/components/analytics/analytics-stats"
import { PortfolioChart } from "@/components/analytics/portfolio-chart"
import { ActivityChart } from "@/components/analytics/activity-chart"
import { RateChart } from "@/components/analytics/rate-chart"

export default function AnalyticsPage() {
  const { address } = useStellarWallet()
  const { eventCount } = useSorobanEvents(address)
  const {
    portfolioData,
    activityData,
    rateData,
    totalReturns,
    totalVolume,
    tradeCount,
    apy,
    loading,
    stxlmBalance,
    exchangeRate,
  } = useAnalytics(address, eventCount)

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Heading>Analytics</Heading>
        <p className="text-sm text-zinc-400 mt-1">
          {address
            ? `Your stXLM performance and protocol metrics`
            : "Connect your wallet to see your staking analytics"}
        </p>
      </motion.div>

      <AnalyticsStats
        totalReturns={totalReturns}
        totalVolume={totalVolume}
        tradeCount={tradeCount}
        apy={apy}
        loading={loading}
      />

      <PortfolioChart
        data={portfolioData}
        stxlmBalance={stxlmBalance}
        exchangeRate={exchangeRate}
        loading={loading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivityChart data={activityData} loading={loading} />
        <RateChart data={rateData} currentRate={exchangeRate} loading={loading} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
