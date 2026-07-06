"use client"

import { motion } from "motion/react"
import { Heading } from "@/components/ui/heading"
import { StakeForm } from "@/components/stake/stake-form"
import { StakeStats } from "@/components/stake/stake-stats"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import { useBalance } from "@/hooks/useBalance"
import { useVault } from "@/hooks/useVault"

export default function StakePage() {
  const { address } = useStellarWallet()
  const { xlmBalance, stXlmBalance } = useBalance(address)
  const { exchangeRate, loading: vaultLoading } = useVault()

  const rate = Number(exchangeRate)
  const apy = rate > 1 ? ((rate - 1) * 100).toFixed(2) : "0.00"

  return (
    <div className="flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Heading>Stake XLM</Heading>
        <p className="text-sm text-zinc-400 mt-1">Deposit XLM and receive stXLM, a yield-bearing receipt token</p>
      </motion.div>

      {address && (
        <StakeStats
          items={[
            { label: "XLM Balance", value: `${Number.parseFloat(xlmBalance).toFixed(2)} XLM`, monospace: true },
            { label: "stXLM Balance", value: `${Number.parseFloat(stXlmBalance).toFixed(2)} stXLM`, monospace: true, accent: true },
            { label: "Exchange Rate", value: vaultLoading ? "..." : rate.toFixed(4), monospace: true },
            { label: "APY", value: `${apy}%`, monospace: true },
          ]}
        />
      )}

      <StakeForm exchangeRate={exchangeRate} vaultLoading={vaultLoading} />
    </div>
  )
}
