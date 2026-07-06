"use client"

import { Dialog } from "@/components/ui/dialog"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import { Wallet, Plug } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

interface WalletModalProps {
  open: boolean
  onClose: () => void
}

export function WalletModal({ open, onClose }: WalletModalProps) {
  const { wallet, connect, disconnect } = useStellarWallet()

  if (wallet) {
    return (
      <Dialog open={open} onClose={onClose} title="Connected Wallet">
        <div className="flex flex-col gap-3">
          <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">Address</p>
            <p className="mt-1 font-mono text-sm text-[var(--color-text-primary)] break-all">{wallet.address}</p>
          </div>
          <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">Wallet</p>
            <p className="mt-1 text-sm text-[var(--color-text-primary)]">{wallet.walletName}</p>
          </div>
          <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">Network</p>
            <p className="mt-1 text-sm text-[var(--color-text-primary)]">{wallet.network}</p>
          </div>
          <div className="mt-1">
            <Button
              variant="danger"
              className="w-full"
              onClick={() => {
                disconnect()
                onClose()
              }}
            >
              <Plug size={15} />
              Disconnect
            </Button>
          </div>
        </div>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} title="Select Wallet">
      <p className="mb-4 text-sm text-zinc-500">Choose a wallet to connect with Stellar</p>
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => {
          connect()
          onClose()
        }}
      >
        <Wallet size={15} />
        Open Wallet Selector
      </Button>
    </Dialog>
  )
}
