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
import { useBalance } from "@/hooks/useBalance"
import { STELLAR_EXPERT_URL } from "@/lib/stellar"
import { ArrowDown } from "@phosphor-icons/react"
import type { TxState } from "@/types"

interface UnstakeFormProps {
  exchangeRate: string
  vaultLoading: boolean
  onSuccess?: () => void
}

export function UnstakeForm({ exchangeRate, vaultLoading, onSuccess }: UnstakeFormProps) {
  const { address, sign } = useStellarWallet()
  useBalance(address)
  const { state, withdraw, reset } = useStake()
  const [amount, setAmount] = useState("")

  const amountNum = Number.parseFloat(amount) || 0
  const rate = Number.parseFloat(exchangeRate) || 1
  const previewXlm = amountNum > 0 ? (amountNum * rate).toFixed(7) : "0"
  const stxlmBalance = "0"

  const handleMax = () => setAmount(stxlmBalance)
  const handleWithdraw = async () => {
    if (!address || !amount) return
    await withdraw(address, sign, (amountNum * 1e7).toFixed(0))
    if (onSuccess) onSuccess()
  }

  const tx = state as TxState

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <Heading as="h2">Unstake stXLM</Heading>
          <Badge variant="default">1 stXLM ≈ {exchangeRate} XLM</Badge>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Amount (stXLM)"
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!address || tx.status === "submitting" || tx.status === "pending"}
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Balance: {stxlmBalance} stXLM</span>
            <button
              onClick={handleMax}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              disabled={!address}
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
            value={`${previewXlm} XLM`}
            tooltip="Estimated XLM to receive including accrued yield. Final amount may vary."
          />

          {amountNum > 0 && (
            <div className="flex justify-between text-xs text-zinc-500 px-1">
              <span>Exchange rate: 1 stXLM ≈ {exchangeRate} XLM</span>
              <span>Fee: 0%</span>
            </div>
          )}

          <Button
            variant="success"
            size="lg"
            className="w-full mt-2"
            disabled={!address || !amount || amountNum <= 0 || vaultLoading}
            loading={tx.status === "submitting" || tx.status === "pending"}
            onClick={handleWithdraw}
          >
            {!address ? "Connect Wallet" : tx.status === "pending" ? "Confirming..." : "Unstake stXLM"}
          </Button>

          {tx.status === "success" && tx.hash && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-emerald-400 text-center"
            >
              Unstaked successfully!{" "}
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
