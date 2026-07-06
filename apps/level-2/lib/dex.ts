import * as StellarSdk from "@stellar/stellar-sdk"
import { horizon } from "./stellar"
import type { Order } from "@/types"

interface HorizonOrder {
  id: string
  seller: string
  selling: { asset_code?: string; asset_issuer?: string }
  buying: { asset_code?: string; asset_issuer?: string }
  amount: string
  price: string
  price_r: { n: number; d: number }
}

export async function getOrderbook(
  selling: StellarSdk.Asset,
  buying: StellarSdk.Asset,
  limit = 20
): Promise<{ bids: Order[]; asks: Order[] }> {
  const orderbook = await horizon.orderbook(selling, buying).call()

  const mapOrder = (o: HorizonOrder): Order => ({
    id: o.id,
    seller: o.seller,
    selling: {
      code: o.selling.asset_code || "XLM",
      issuer: o.selling.asset_issuer,
    },
    buying: {
      code: o.buying.asset_code || "XLM",
      issuer: o.buying.asset_issuer,
    },
    amount: o.amount,
    price: o.price,
    priceR: o.price_r,
  })

  return {
    bids: ((orderbook.bids ?? []) as HorizonOrder[]).slice(0, limit).map(mapOrder),
    asks: ((orderbook.asks ?? []) as HorizonOrder[]).slice(0, limit).map(mapOrder),
  }
}

export async function fetchBalances(address: string): Promise<Record<string, string>> {
  try {
    const account = await horizon.loadAccount(address)
    const balances: Record<string, string> = {}

    for (const b of account.balances) {
      if (b.asset_type === "native") {
        balances["XLM"] = b.balance
      } else if (b.asset_type !== "liquidity_pool_shares") {
        const balance = b as StellarSdk.Horizon.HorizonApi.BalanceLineAsset
        balances[`${balance.asset_code}:${balance.asset_issuer}`] = balance.balance
      }
    }

    return balances
  } catch {
    return {}
  }
}

export function calculateMinOut(amount: string, slippage: number): string {
  const parsed = Number.parseFloat(amount)
  if (Number.isNaN(parsed)) return "0"
  const min = parsed * (1 - slippage / 100)
  return min.toFixed(7)
}
