import { Badge } from "@/components/ui/badge"

export function NetworkBadge() {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet"

  return (
    <Badge variant={network === "mainnet" ? "warning" : "default"}>
      {network === "mainnet" ? "Mainnet" : "Testnet"}
    </Badge>
  )
}
