"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { ArrowsDownUp } from "@phosphor-icons/react"
import type { TxState } from "@/types"

interface SwapButtonProps {
  connected: boolean
  hasAmount: boolean
  hasTokens: boolean
  hasBalance: boolean
  txState: TxState
  onSwap: () => void
}

export function SwapButton({
  connected,
  hasAmount,
  hasTokens,
  hasBalance,
  txState,
  onSwap,
}: SwapButtonProps) {
  const isProcessing = txState.status === "building" || txState.status === "signing" || txState.status === "submitting" || txState.status === "pending"

  const getButtonLabel = () => {
    if (!connected) return "Connect Wallet"
    if (!hasTokens) return "Select Tokens"
    if (!hasAmount) return "Enter Amount"
    if (!hasBalance) return "Insufficient Balance"
    if (isProcessing) return txState.message ?? "Processing..."
    return "Swap"
  }

  const isDisabled = !connected || !hasTokens || !hasAmount || !hasBalance || isProcessing

  return (
    <div className="flex items-center gap-2">
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="flex-1"
      >
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isDisabled}
          loading={isProcessing}
          onClick={onSwap}
        >
          {!isProcessing && <ArrowsDownUp size={15} weight="bold" />}
          {getButtonLabel()}
        </Button>
      </motion.div>
    </div>
  )
}
