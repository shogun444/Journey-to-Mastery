"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { AccountDisplay } from "./account-display"
import { NetworkBadge } from "./network-badge"
import { useStellarWallet } from "@/hooks/useStellarWallet"
import { SignOut } from "@phosphor-icons/react"

export function ConnectButton() {
  const { address, connect, disconnect } = useStellarWallet()
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      {address ? (
        <div className="flex items-center gap-3">
          <NetworkBadge />
          <AccountDisplay address={address} />
          <Button variant="ghost" size="sm" onClick={() => setShowConfirm(true)}>
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <NetworkBadge />
          <Button variant="primary" size="sm" onClick={connect}>
            Connect Wallet
          </Button>
        </div>
      )}

      {typeof document !== "undefined" && createPortal(
        <Dialog open={showConfirm} onClose={() => setShowConfirm(false)} className="max-w-lg">
          <div className="flex flex-col text-center">
            <div className="mx-auto w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <SignOut size={20} className="text-red-400" />
            </div>
            <p className="text-base font-semibold text-zinc-100 mt-3 mb-1">Disconnect Wallet</p>
            <p className="text-sm text-zinc-400 mb-4 max-w-xs mx-auto leading-relaxed">
              Are you sure you want to disconnect your wallet? You&apos;ll need to reconnect to use the app.
            </p>
            <div className="flex gap-3 w-full mt-1">
              <Button variant="secondary" size="md" className="flex-1" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                onClick={() => {
                  disconnect()
                  setShowConfirm(false)
                }}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </Dialog>,
        document.body
      )}
    </>
  )
}
