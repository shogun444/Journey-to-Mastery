"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import { Wallet } from "@phosphor-icons/react"

interface ConnectButtonProps {
  onOpenWalletModal: () => void
}

export function ConnectButton({ onOpenWalletModal }: ConnectButtonProps) {
  const { wallet, error } = useStellarWallet()

  if (wallet) {
    const shortAddress = `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        <Badge variant="success">{wallet.walletName}</Badge>
        <span className="font-mono text-xs text-zinc-500">{shortAddress}</span>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="primary" size="sm" onClick={onOpenWalletModal}>
        <Wallet size={15} />
        Connect Wallet
      </Button>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400/80"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
