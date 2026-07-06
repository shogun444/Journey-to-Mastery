"use client"

import { Button } from "@/components/ui/button"
import { AccountDisplay } from "./account-display"
import { NetworkBadge } from "./network-badge"
import { useStellarWallet } from "@/hooks/useStellarWallet"

export function ConnectButton() {
  const { address, connect, disconnect } = useStellarWallet()

  return (
    <>
      {address ? (
        <div className="flex items-center gap-3">
          <NetworkBadge />
          <AccountDisplay address={address} />
          <Button variant="ghost" size="sm" onClick={disconnect}>
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
    </>
  )
}
