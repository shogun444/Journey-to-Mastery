"use client"

import { useState, useCallback, useEffect } from "react"
import {
  StellarWalletsKit,
  Networks,
  KitEventType,
  SwkAppDarkTheme,
} from "@creit.tech/stellar-wallets-kit"
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils"
import type { WalletInfo } from "@/types"

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet"

export function useStellarWallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    StellarWalletsKit.init({
      modules: defaultModules(),
      network: NETWORK === "testnet" ? Networks.TESTNET : Networks.PUBLIC,
      theme: SwkAppDarkTheme,
    })
  }, [])

  useEffect(() => {
    const unsub = StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event) => {
      const { address, networkPassphrase } = event.payload
      if (address && networkPassphrase) {
        setWallet({
          address,
          network: networkPassphrase,
          walletId: "connected",
          walletName: "Wallet",
        })
        setError(null)
      } else {
        setWallet(null)
      }
    })

    return () => unsub()
  }, [])

  const connect = useCallback(async () => {
    setError(null)
    try {
      const { address } = await StellarWalletsKit.authModal()
      const { networkPassphrase } = await StellarWalletsKit.getNetwork()
      setWallet({
        address,
        network: networkPassphrase,
        walletId: "connected",
        walletName: "Wallet",
      })
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? ""
      if (msg.includes("closed") || msg.includes("rejected")) {
        setError("Connection cancelled.")
      } else if (msg.includes("installed") || msg.includes("found")) {
        setError("Wallet not found. Please install a Stellar wallet.")
      } else {
        setError(msg || "Failed to connect.")
      }
    }
  }, [])

  const disconnect = useCallback(() => {
    StellarWalletsKit.disconnect()
    setWallet(null)
    setError(null)
  }, [])

  const sign = useCallback(
    async (xdr: string): Promise<string> => {
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr)
      return signedTxXdr
    },
    []
  )

  return { wallet, error, connect, disconnect, sign }
}
