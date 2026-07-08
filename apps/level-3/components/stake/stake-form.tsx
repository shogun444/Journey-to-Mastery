"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heading } from "@/components/ui/heading"
import { PreviewDisplay } from "./preview-display"
import { useStake } from "@/hooks/useStake"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import { STELLAR_EXPERT_URL } from "@/lib/stellar"
import { ArrowDown } from "@phosphor-icons/react"
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

  const xlmNum = Number.parseFloat(xlmBalance)
  const amountNum = Number.parseFloat(amount) || 0
  const rate = Number.parseFloat(exchangeRate) || 1
  const previewShares = amountNum > 0 && rate > 0 ? (amountNum / rate).toFixed(7) : "0"

  const isPending = state.status === "submitting" || state.status === "pending"

  const effectiveXlm = Math.max(0, xlmNum - optimisticAmount)

  const handleMax = () => setAmount(String(effectiveXlm))
  const handleDeposit = async () => {
    if (!address || !amount) return
    setOptimisticAmount(amountNum)
    try {
      await deposit(address, sign, (Number.parseFloat(amount) * 1e7).toFixed(0), onSuccess)
    } finally {
      setOptimisticAmount(0)
    }
  }

  const tx = state as TxState

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <Heading as="h2">Stake XLM</Heading>
          <Badge variant="default">1 XLM ≈ {(1 / rate).toFixed(7)} stXLM</Badge>
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
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ArrowDown size={20} className="text-zinc-500" />
            </motion.div>
          </div>

          <PreviewDisplay
            label="You receive"
            value={`${previewShares} stXLM`}
            tooltip="Estimated stXLM to receive. Final amount may vary."
          />

          {amountNum > 0 && xlmNum > 0 && (
            <div className="flex justify-between text-xs text-zinc-500 px-1">
              <span>Exchange rate: 1 XLM ≈ {(1 / rate).toFixed(7)} stXLM</span>
              <span>Fee: 0%</span>
            </div>
          )}

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

          {tx.status === "success" && tx.hash && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-emerald-400 text-center"
            >
              Staked successfully!{" "}
              <a
                href={`${STELLAR_EXPERT_URL}/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View on StellarExpert
              </a>
              <button onClick={reset} className="ml-2 text-zinc-400 hover:text-zinc-200 underline">
                Reset
              </button>
            </motion.p>
          )}

          {tx.status === "failed" && (
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
    </motion.div>
  )
}
