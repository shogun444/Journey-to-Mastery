"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "motion/react"
import { STELLAR_TOKENS } from "@/lib/tokens"
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

export function SwapForm() {
  const { wallet } = useStellarWallet()
  const { getTokenBalance } = useBalance(wallet?.address ?? null)
  const { bids, asks, loading: obLoading, fetchOrderbook } = useOrderbook()
  const { txState, executeSwap, resetTxState } = useSwap()

  const [sourceToken, setSourceToken] = useState<Token>(STELLAR_TOKENS[0]!)
  const [destToken, setDestToken] = useState<Token>(STELLAR_TOKENS[1]!)
  const [amount, setAmount] = useState("")
  const [slippage, setSlippage] = useState(1)
  const [slippageInput, setSlippageInput] = useState("1")

  const sourceBalance = wallet ? getTokenBalance(sourceToken) : "0"
  const hasBalance = sourceBalance !== "0" && Number.parseFloat(sourceBalance) >= Number.parseFloat(amount || "0")
  const hasAmount = amount !== "" && Number.parseFloat(amount) > 0
  const hasTokens = sourceToken.code !== destToken.code
  const FALLBACK_RATE = "0.25"
  const bestAsk = asks[0]
  const hasOrderbookData = bids.length > 0 && asks.length > 0
  const currentRate = bestAsk ? Number(bestAsk.price).toFixed(7) : FALLBACK_RATE
  const isEstimated = !hasOrderbookData
  const receiveAmount = amount && hasTokens
    ? (Number.parseFloat(amount) * Number.parseFloat(currentRate)).toFixed(7)
    : null
  const minReceive = receiveAmount
    ? (Number.parseFloat(receiveAmount) * (1 - slippage / 100)).toFixed(7)
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

  const handleSwitchTokens = useCallback(() => {
    setSourceToken(destToken)
    setDestToken(sourceToken)
    resetTxState()
  }, [sourceToken, destToken, resetTxState])

  const handleSwap = useCallback(async () => {
    if (!hasTokens) return
    const path: StellarSdk.Asset[] = []
    await executeSwap(sourceToken, destToken, amount, slippage, path)
  }, [sourceToken, destToken, amount, slippage, executeSwap, hasTokens])

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
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">You Pay</p>
            <div className="flex items-center gap-2">
              {wallet && (
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="text-xs text-blue-400/70 transition-colors hover:text-blue-300"
                >
                  Balance: {Number(sourceBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
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
          className="absolute -top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--glass)] text-zinc-500 shadow-[var(--shadow-card)] ring-1 ring-[var(--glass-border)] transition-all duration-200 hover:bg-[var(--glass-hover)] hover:text-zinc-300"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </motion.button>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">You Receive</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="rounded-xl bg-[var(--glass)] p-[1px] ring-1 ring-[var(--glass-border)]">
                <div className="flex h-10 items-center rounded-[calc(0.75rem-1px)] bg-gradient-to-b from-[var(--glass-gradient)] to-transparent px-4">
                  <p className="font-mono text-sm text-zinc-400">
                    {receiveAmount ? `~${receiveAmount}` : "0.0"}
                  </p>
                </div>
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
          className="rounded-2xl bg-[var(--glass)] p-[1px] shadow-[var(--shadow-card)] ring-1 ring-[var(--glass-border)]"
        >
          <div className="rounded-[calc(2rem-1px)] bg-gradient-to-b from-[var(--glass-gradient)] to-transparent p-5">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">Swap Details</p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">You Pay</span>
                <span className="font-mono text-sm text-zinc-300">{amount} {sourceToken.code}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Rate</span>
                <span className="font-mono text-sm text-zinc-300">
                  1 {sourceToken.code} = {currentRate} {destToken.code}
                  {isEstimated && <span className="ml-1.5 text-[10px] text-amber-400/80">est.</span>}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">You Receive</span>
                <span className="font-mono text-sm text-zinc-300">
                  ~{receiveAmount} {destToken.code}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Min. Received</span>
                <span className="font-mono text-sm text-zinc-500">
                  {minReceive} {destToken.code}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--glass-border)] pt-3">
                <span className="text-xs text-zinc-500">Slippage</span>
                <div className="flex items-center gap-1">
                  {[0.5, 1, 2.5, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setSlippage(s); setSlippageInput(String(s)) }}
                      className={`rounded-lg px-2 py-0.5 text-xs font-mono transition-all duration-200 ${
                        slippage === s
                          ? "bg-blue-500/15 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                          : "text-zinc-500 hover:bg-[var(--glass-hover)] hover:text-zinc-300"
                      }`}
                    >
                      {s}%
                    </button>
                  ))}
                  <div className="ml-1 rounded-lg bg-[var(--glass)] p-[1px] ring-1 ring-[var(--glass-border)]">
                    <input
                      type="number"
                      value={slippageInput}
                      onChange={(e) => {
                        setSlippageInput(e.target.value)
                        const v = Number.parseFloat(e.target.value)
                        if (!Number.isNaN(v) && v >= 0) setSlippage(v)
                      }}
                      className="h-6 w-11 rounded-[calc(0.5rem-1px)] bg-transparent px-1 text-center font-mono text-xs text-[var(--glass-text)] outline-none"
                      min={0}
                      max={100}
                      step={0.1}
                    />
                  </div>
                  <span className="text-xs text-zinc-600">%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {hasAmount && hasTokens && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="rounded-2xl bg-amber-500/[0.02] p-[1px] ring-1 ring-amber-500/10"
        >
          <div className="rounded-[calc(2rem-1px)] bg-gradient-to-b from-amber-500/[0.03] to-transparent p-4">
            <p className="text-xs font-medium text-amber-400/80">Stellar DEX Swap</p>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
              Swaps execute via the Stellar decentralized exchange orderbook. Settlement typically completes in 3-5 seconds. Recommended slippage: 0.5%.
            </p>
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
        txState={txState}
        onSwap={handleSwap}
      />

      <TransactionStatus txState={txState} onDismiss={resetTxState} />
    </motion.div>
  )
}
