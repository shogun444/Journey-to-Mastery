"use client"

import { Dialog } from "@/components/ui/dialog"

const wallets = [
  { id: "freighter", name: "Freighter", desc: "Browser extension" },
  { id: "lobstr", name: "LOBSTR", desc: "Mobile wallet" },
  { id: "xbull", name: "xBull", desc: "Browser extension" },
  { id: "albedo", name: "Albedo", desc: "Web wallet" },
  { id: "rabet", name: "Rabet", desc: "Browser extension" },
  { id: "hana", name: "Hana", desc: "Web wallet" },
]

interface WalletModalProps {
  open: boolean
  onClose: () => void
  onSelect: (id: string) => void
}

export function WalletModal({ open, onClose, onSelect }: WalletModalProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Connect Wallet">
      <div className="flex flex-col gap-2">
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => {
              onSelect(wallet.id)
              onClose()
            }}
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-all duration-150"
          >
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-zinc-100">{wallet.name}</span>
              <span className="text-xs text-zinc-500">{wallet.desc}</span>
            </div>
            <span className="text-xs text-zinc-500">→</span>
          </button>
        ))}
      </div>
    </Dialog>
  )
}
