"use client"

import { motion } from "motion/react"
import { Heading } from "@/components/ui/heading"
import { StakeForm } from "@/components/stake/stake-form"
import { StakeStats } from "@/components/stake/stake-stats"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import { useBalance } from "@/hooks/useBalance"

export default function StakePage() {
  const { address } = useStellarWallet()
  const { xlmBalance } = useBalance(address)

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
            { label: "stXLM Balance", value: "0.00 stXLM", monospace: true, accent: true },
            { label: "Exchange Rate", value: "1.0000", monospace: true },
            { label: "APY", value: "0.00%", monospace: true },
          ]}
        />
      )}

      <StakeForm exchangeRate="1.0000" vaultLoading={false} />
    </div>
  )
}
