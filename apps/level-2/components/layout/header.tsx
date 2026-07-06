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
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="fixed left-0 right-0 top-0 z-30 flex justify-center pt-4"
      >
        <motion.nav className="mx-auto flex h-12 items-center justify-between gap-3 rounded-full bg-[var(--glass)] px-4 shadow-[var(--shadow-card)] ring-1 ring-[var(--glass-border)] backdrop-blur-2xl">
          <div className="flex items-center gap-3 pl-1">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <ArrowsDownUp size={18} className="text-blue-400" />
            </motion.div>
            <span className="text-sm font-semibold text-[var(--glass-text)]">Stellar Swap</span>
            <NetworkBadge />
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {wallet && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setWalletOpen(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-zinc-500 transition-all duration-200 hover:bg-[var(--glass-hover)] hover:text-zinc-300"
              >
                <User size={13} />
                {wallet.address.slice(0, 4)}...
              </motion.button>
            )}
            <ConnectButton onOpenWalletModal={() => setWalletOpen(true)} />
          </div>
        </motion.nav>
      </motion.header>

      <div className="h-20" />

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  )
}
