"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heading } from "@/components/ui/heading"
import { PreviewDisplay } from "./preview-display"
import { TransactionSuccessModal, type SuccessDetails } from "./transaction-success-modal"
import { TrustlineCard } from "./trustline-card"
import { useStake } from "@/hooks/useStake"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import { useLiveMarket } from "@/hooks/useLiveMarket"
import { ArrowDown, TrendUp, TrendDown } from "@phosphor-icons/react"
import type { TxState } from "@/types"

interface StakeFormProps {
  exchangeRate: string
  vaultLoading: boolean
  xlmBalance: string
  onSuccess?: () => void
}

export function StakeForm({ exchangeRate, vaultLoading, xlmBalance, onSuccess }: StakeFormProps) {
  const { address, sign } = useStellarWallet()
  const { state, deposit, reset } = useStake()
  const [amount, setAmount] = useState("")
  const [optimisticAmount, setOptimisticAmount] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successDetails, setSuccessDetails] = useState<SuccessDetails | null>(null)

  const vaultRate = Number.parseFloat(exchangeRate) || 1
  const { currentRate, lastChange } = useLiveMarket({ baseRate: vaultRate })

  const liveRate = currentRate || vaultRate
  const xlmNum = Number.parseFloat(xlmBalance)
  const amountNum = Number.parseFloat(amount) || 0
  const previewShares = amountNum > 0 && liveRate > 0 ? (amountNum / liveRate).toFixed(7) : "0"

  const isPending = state.status === "submitting" || state.status === "pending"
  const effectiveXlm = Math.max(0, xlmNum - optimisticAmount)

  const handleMax = () => setAmount(String(effectiveXlm))

  const handleDeposit = async () => {
    if (!address || !amount) return
    const staked = amountNum
    const received = Number(previewShares)
    const rateAtSubmit = liveRate
    setOptimisticAmount(amountNum)
    try {
      await deposit(address, sign, (staked * 1e7).toFixed(0), (hash: string) => {
        setSuccessDetails({
          type: "stake",
          inputAmount: staked.toFixed(2),
          inputAsset: "XLM",
          outputAmount: received.toFixed(7),
          outputAsset: "stXLM",
          rateLabel: `1 XLM ≈ ${(1 / rateAtSubmit).toFixed(7)} stXLM`,
          slippageTolerance: "0.50%",
          networkFee: "0.0000100 XLM",
          hash,
        })
        setShowSuccess(true)
        if (onSuccess) onSuccess()
      })
    } finally {
      setOptimisticAmount(0)
    }
  }

  const closeModal = () => {
    setShowSuccess(false)
    reset()
    setAmount("")
  }

  const tx = state as TxState

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <Heading as="h2">Stake XLM</Heading>
          <Badge variant="default" className="flex items-center gap-1">
            1 XLM ≈ {(1 / liveRate).toFixed(7)} stXLM
            {lastChange >= 0 ? (
              <TrendUp size={12} className="text-emerald-400" />
            ) : (
              <TrendDown size={12} className="text-red-400" />
            )}
          </Badge>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Amount (XLM)"
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!address || isPending}
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              Balance:{" "}
              {optimisticAmount > 0 ? (
                <>
                  <span className="text-zinc-400">{effectiveXlm.toFixed(7)}</span>{" "}
                  <span className="text-zinc-600">({xlmNum.toFixed(7)} - {optimisticAmount.toFixed(2)})</span>
                </>
              ) : (
                <span>{xlmBalance} XLM</span>
              )}
              {isPending && <span className="text-amber-400 ml-2">pending...</span>}
            </span>
            <button
              onClick={handleMax}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              disabled={!address || isPending}
            >
              Max
            </button>
          </div>

          <div className="flex justify-center">
            <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <ArrowDown size={20} className="text-zinc-500" />
            </motion.div>
          </div>

          <PreviewDisplay
            label="You receive"
            value={`${previewShares} stXLM`}
            tooltip="Estimated stXLM to receive at the current market rate. Final amount may vary."
            rate={amountNum > 0 ? `1 XLM ≈ ${(1 / liveRate).toFixed(7)} stXLM` : undefined}
            rateTrend={amountNum > 0 ? (lastChange >= 0 ? "up" : "down") : undefined}
            slippage={amountNum > 0 ? "0.50%" : undefined}
            fee={amountNum > 0 ? "0%" : undefined}
          />

          <Button
            variant="success"
            size="lg"
            className="w-full mt-2"
            disabled={!address || !amount || amountNum <= 0 || amountNum > effectiveXlm || vaultLoading}
            loading={isPending}
            onClick={handleDeposit}
          >
            {!address ? "Connect Wallet" : isPending ? "Confirming..." : "Stake XLM"}
          </Button>

          {tx.status === "failed" && tx.errorCode === "TRUSTLINE_MISSING" && (
            <TrustlineCard />
          )}
          {tx.status === "failed" && tx.errorCode !== "TRUSTLINE_MISSING" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-400 text-center"
            >
              {tx.error || "Transaction failed."}
            </motion.p>
          )}
        </div>
      </Card>

      <TransactionSuccessModal open={showSuccess} onClose={closeModal} details={successDetails} />
    </motion.div>
  )
}
