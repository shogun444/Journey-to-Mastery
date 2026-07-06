export interface Token {
  code: string
  issuer: string
  contractId?: string
  name: string
  icon?: string
  decimals: number
  balance?: string
}

export interface SwapParams {
  sourceToken: Token
  destToken: Token
  amount: string
  minAmountOut: string
  slippage: number
  sourceAddress: string
}

export interface Order {
  id: string
  seller: string
  selling: { code: string; issuer?: string }
  buying: { code: string; issuer?: string }
  amount: string
  price: string
  priceR: { n: number; d: number }
}

export type TxStatus = "idle" | "building" | "signing" | "submitting" | "pending" | "success" | "failed"

export interface TxState {
  status: TxStatus
  hash?: string
  error?: string
  message?: string
}

export interface Transaction {
  id: string
  hash: string
  type: "send" | "receive" | "swap"
  amount: string
  asset: string
  counterparty: string
  timestamp: string
  status: "success" | "failed"
}

export interface WalletInfo {
  address: string
  network: string
  walletId: string
  walletName: string
}
