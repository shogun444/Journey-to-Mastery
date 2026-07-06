"use client"

import { useState, useCallback, useEffect } from "react"
import {
  StellarWalletsKit,
  Networks,
  KitEventType,
} from "@creit.tech/stellar-wallets-kit"
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils"
import { config } from "@/lib/stellar"

let inited = false

function ensureInit() {
  if (inited) return
  const network = config.networkPassphrase.includes("Test")
    ? Networks.TESTNET
    : Networks.PUBLIC
  StellarWalletsKit.init({ modules: defaultModules(), network })
  inited = true
}

export function useStellarWallet() {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    ensureInit()
    const unsub = StellarWalletsKit.on(
      KitEventType.STATE_UPDATED,
      (event) => {
        setAddress(event.payload.address ?? null)
      }
    )
    return unsub
  }, [])

  const connect = useCallback(async () => {
    const result = await StellarWalletsKit.authModal()
    if (result?.address) {
      setAddress(result.address)
    }
  }, [])

  const disconnect = useCallback(async () => {
    await StellarWalletsKit.disconnect()
    setAddress(null)
  }, [])

  const sign = useCallback(
    async (xdr: string): Promise<string> => {
      const result = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: config.networkPassphrase,
        address: address ?? undefined,
      })
      return result.signedTxXdr
    },
    [address]
  )

  return { address, connect, disconnect, sign }
}
