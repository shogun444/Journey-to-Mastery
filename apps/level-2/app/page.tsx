"use client"

import { motion } from "motion/react"
import { Header } from "@/components/layout/header"
import { SwapForm } from "@/components/swap/swap-form"
import { AccountDisplay } from "@/components/wallet/account-display"
import { Heading } from "@/components/ui/heading"
import { Subheading } from "@/components/ui/subheading"

export default function Home() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-12 px-4 py-16 md:px-6 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="flex flex-col gap-3"
        >
          <Subheading>Stellar DEX</Subheading>
          <Heading as="h1">Swap Tokens</Heading>
          <p className="text-sm text-zinc-500">
            Swap tokens using the Stellar DEX orderbook
          </p>
        </motion.div>

        <AccountDisplay />
        <SwapForm />
      </main>

      <footer className="border-t border-[var(--glass-border)] py-6 text-center">
        <p className="text-xs text-zinc-600">
          Stellar Swap &mdash; Built on Stellar Testnet
        </p>
      </footer>
    </div>
  )
}
