"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "motion/react"
import { STELLAR_TOKENS, getFallbackRate } from "@/lib/tokens"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import { useBalance } from "@/hooks/useBalance"
import { useOrderbook } from "@/hooks/useOrderbook"
import { useSwap } from "@/hooks/useSwap"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TokenSelect } from "./token-select"
import { RateDisplay } from "./rate-display"
import { SwapButton } from "./swap-button"
import { TransactionStatus } from "./transaction-status"
import * as StellarSdk from "@stellar/stellar-sdk"
import type { Token } from "@/types"

interface SwapFormProps {
  onSwapSuccess?: () => void
}

export function SwapForm({ onSwapSuccess }: SwapFormProps) {
  const { wallet } = useStellarWallet()
  const { getTokenBalance, refetch: refetchBalances } = useBalance(wallet?.address ?? null)
  const { bids, asks, loading: obLoading, fetchOrderbook } = useOrderbook()
  const { txState, executeSwap, logSwapOnContract, resetTxState } = useSwap()

  const [sourceToken, setSourceToken] = useState<Token>(STELLAR_TOKENS[0]!)
  const [destToken, setDestToken] = useState<Token>(STELLAR_TOKENS[1]!)
  const [amount, setAmount] = useState("")
  const [slippage, setSlippage] = useState(1)
  const [slippageInput, setSlippageInput] = useState("1")

  const sourceBalance = wallet ? getTokenBalance(sourceToken) : "0"
  const hasBalance = sourceBalance !== "0" && Number.parseFloat(sourceBalance) >= Number.parseFloat(amount || "0")
  const [lastSwap, setLastSwap] = useState<{ sourceToken: Token; destToken: Token; amount: string; receiveAmount: string } | null>(null)
  const hasAmount = amount !== "" && Number.parseFloat(amount) > 0
  const hasTokens = sourceToken.code !== destToken.code
  const bestAsk = asks[0]
  const hasLiquidity = bids.length > 0 && asks.length > 0
  const fallbackRate = hasTokens ? getFallbackRate(sourceToken.code, destToken.code) : null
  const hasRate = hasLiquidity || fallbackRate !== null
  const currentRate = hasLiquidity && bestAsk
    ? Number(bestAsk.price).toFixed(7)
    : fallbackRate !== null
      ? fallbackRate.toFixed(7)
      : null
  const receiveAmount = amount && hasTokens && hasRate && currentRate
    ? (Number.parseFloat(amount) * Number.parseFloat(currentRate)).toFixed(7)
    : null
  useEffect(() => {
    if (sourceToken && destToken) {
      try {
        const sourceAsset = sourceToken.code === "XLM"
          ? StellarSdk.Asset.native()
          : new StellarSdk.Asset(sourceToken.code, sourceToken.issuer)
        const destAsset = destToken.code === "XLM"
          ? StellarSdk.Asset.native()
          : new StellarSdk.Asset(destToken.code, destToken.issuer)

        fetchOrderbook(sourceAsset, destAsset)
      } catch {
        // Invalid asset params — orderbook won't load
      }
    }
  }, [sourceToken, destToken, fetchOrderbook])

  useEffect(() => {
    if (txState.status === "success") {
      refetchBalances()
      onSwapSuccess?.()
      if (receiveAmount) {
        setLastSwap({ sourceToken, destToken, amount, receiveAmount })
      }
    }
  }, [txState.status, refetchBalances, onSwapSuccess, sourceToken, destToken, amount, receiveAmount])

  const handleSwitchTokens = useCallback(() => {
    setSourceToken(destToken)
    setDestToken(sourceToken)
    resetTxState()
  }, [sourceToken, destToken, resetTxState])

  const handleSwap = useCallback(async () => {
    if (!hasTokens || !receiveAmount || !hasRate) return
    const path: StellarSdk.Asset[] = []
    await executeSwap(sourceToken, destToken, amount, receiveAmount, slippage, path)
  }, [sourceToken, destToken, amount, receiveAmount, slippage, executeSwap, hasTokens, hasRate])

  const handleMaxClick = useCallback(() => {
    if (sourceBalance && sourceBalance !== "0") {
      setAmount(sourceBalance)
    }
  }, [sourceBalance])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      className="space-y-5"
    >
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">You Pay</p>
            <div className="flex items-center gap-2">
              {wallet && (
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="text-sm text-blue-400/70 transition-colors hover:text-blue-300"
                >
                  {Number(sourceBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                min={0}
                step="any"
              />
            </div>
            <div className="w-44">
              <TokenSelect
                tokens={STELLAR_TOKENS}
                selected={sourceToken}
                balance={sourceBalance}
                onSelect={setSourceToken}
                label="Source Tokens"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="relative flex justify-center">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          onClick={handleSwitchTokens}
          className="absolute -top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-elevated)] text-zinc-500 shadow-lg border border-[var(--color-border)] transition-all duration-200 hover:bg-[var(--color-surface-hover)] hover:text-zinc-300"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </motion.button>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">You Receive</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex h-10 items-center rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-4">
                <p className="font-mono text-sm text-zinc-400">
                  {receiveAmount ? `~${receiveAmount} ${destToken.code}` : "0.0"}
                </p>
              </div>
            </div>
            <div className="w-44">
              <TokenSelect
                tokens={STELLAR_TOKENS}
                selected={destToken}
                onSelect={setDestToken}
                label="Destination Tokens"
              />
            </div>
          </div>
        </div>
      </Card>

      {hasAmount && hasTokens && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-5"
        >
          <p className="mb-4 text-sm font-bold tracking-wide text-zinc-400">Swap Details</p>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-lg bg-amber-500/[0.06] -mx-2 px-2 py-1.5">
              <span className="text-sm font-bold text-amber-400">You Pay</span>
              <span className="font-mono text-base font-bold text-amber-300">{amount} {sourceToken.code}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500">Rate</span>
              <span className="font-mono text-base text-zinc-300">
                {currentRate
                  ? `1 ${sourceToken.code} = ${currentRate} ${destToken.code}`
                  : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-emerald-500/[0.06] -mx-2 px-2 py-1.5">
              <span className="text-sm font-bold text-emerald-400">You Receive</span>
              <span className="font-mono text-base font-bold text-emerald-300">
                {receiveAmount ? `~${receiveAmount} ${destToken.code}` : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
              <span className="text-sm font-semibold text-zinc-500">Slippage</span>
              <div className="flex items-center gap-1">
                {[0.5, 1, 2.5, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setSlippage(s); setSlippageInput(String(s)) }}
                    className={`rounded-lg px-3 py-1 text-sm font-bold font-mono transition-all duration-200 ${
                      slippage === s
                        ? "bg-blue-500/15 text-blue-400"
                        : "text-zinc-500 hover:bg-[var(--color-surface-hover)] hover:text-zinc-300"
                    }`}
                  >
                    {s}%
                  </button>
                ))}
                <div className="ml-1 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                  <input
                    type="number"
                    value={slippageInput}
                    onChange={(e) => {
                      setSlippageInput(e.target.value)
                      const v = Number.parseFloat(e.target.value)
                      if (!Number.isNaN(v) && v >= 0) setSlippage(v)
                    }}
                    className="h-8 w-14 rounded-lg bg-transparent px-1 text-center font-mono text-sm font-bold text-[var(--color-text-primary)] outline-none"
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </div>
                <span className="text-sm font-semibold text-zinc-600">%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <RateDisplay
        bids={bids}
        asks={asks}
        loading={obLoading}
      />

      <SwapButton
        connected={!!wallet}
        hasAmount={hasAmount}
        hasTokens={hasTokens}
        hasBalance={hasBalance}
        hasRate={hasRate}
        txState={txState}
        onSwap={handleSwap}
      />

      <TransactionStatus
        txState={txState}
        onDismiss={resetTxState}
        onContractLog={lastSwap ? () => logSwapOnContract(lastSwap.sourceToken, lastSwap.destToken, lastSwap.amount, lastSwap.receiveAmount) : undefined}
      />
    </motion.div>
  )
}
