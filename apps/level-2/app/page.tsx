"use client"

import { useState, useCallback } from "react"
import { Header } from "@/components/layout/header"
import { SwapForm } from "@/components/swap/swap-form"
import { AssetSelector } from "@/components/swap/asset-selector"
import { PriceChart } from "@/components/swap/price-chart"
import { TransactionsPanel } from "@/components/swap/transactions-panel"
import { Heading } from "@/components/ui/heading"
import { STELLAR_TOKENS } from "@/lib/tokens"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import { useBalance } from "@/hooks/useBalance"
import { useTransactions } from "@/hooks/useTransactions"
import type { Token } from "@/types"

export default function Home() {
  const { wallet } = useStellarWallet()
  const { balances } = useBalance(wallet?.address ?? null)
  const { transactions, loading: txLoading, refetch: refetchTransactions } = useTransactions(wallet?.address ?? null)

  const [selectedAsset, setSelectedAsset] = useState<Token>(STELLAR_TOKENS[0]!)

  const handleAssetSelect = useCallback((token: Token) => {
    setSelectedAsset(token)
  }, [])

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-16 md:px-6 md:py-24">
        <Heading as="h1">Swap Tokens</Heading>

        <div className="flex flex-col gap-4">
          <AssetSelector
            tokens={STELLAR_TOKENS}
            selected={selectedAsset}
            balances={balances}
            onSelect={handleAssetSelect}
          />
          <PriceChart token={selectedAsset} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <SwapForm onSwapSuccess={refetchTransactions} />
          </div>

          <div className="lg:sticky lg:top-24">
            <TransactionsPanel
              transactions={transactions}
              loading={txLoading}
              address={wallet?.address ?? null}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--color-border)] py-6 text-center">
        <p className="text-xs text-zinc-600">
          Stellar Swap &mdash; Built on Stellar Testnet
        </p>
      </footer>
    </div>
  )
}
