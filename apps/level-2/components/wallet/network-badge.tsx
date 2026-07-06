"use client"

import { Badge } from "@/components/ui/badge"

export function NetworkBadge() {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet"
  const isTestnet = network === "testnet"

  return (
    <Badge variant={isTestnet ? "warning" : "default"}>
      {isTestnet ? "Testnet" : "Mainnet"}
    </Badge>
  )
}
