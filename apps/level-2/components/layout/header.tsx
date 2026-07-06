"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { NetworkBadge } from "@/components/wallet/network-badge"
import { ConnectButton } from "@/components/wallet/connect-button"
import { WalletModal } from "@/components/wallet/wallet-modal"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import { ArrowsDownUp, User } from "@phosphor-icons/react"

export function Header() {
  const [walletOpen, setWalletOpen] = useState(false)
  const { wallet } = useStellarWallet()

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-30 flex justify-center pt-4">
        <motion.nav className="mx-auto w-6xl flex h-10 items-center justify-between gap-4 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-6 shadow-lg">
          <div className="flex items-center gap-3 pl-1">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <ArrowsDownUp size={22} className="text-blue-400" />
            </motion.div>
            <span className="text-xl font-medium text-[var(--color-text-primary)]">Stellar Swap</span>
            <NetworkBadge />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {wallet && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setWalletOpen(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm text-zinc-500 transition-all duration-200 hover:bg-[var(--color-surface-hover)] hover:text-zinc-300"
              >
                <User size={14} />
                {wallet.address.slice(0, 4)}...
              </motion.button>
            )}
            <ConnectButton onOpenWalletModal={() => setWalletOpen(true)} />
          </div>
        </motion.nav>
      </header>

      <div className="h-20" />

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  )
}
