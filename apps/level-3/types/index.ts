export interface Token {
  code: string
  issuer?: string
  contractId?: string
  name: string
  decimals: number
  balance?: string
}

export interface VaultState {
  totalAssets: string
  totalSupply: string
  exchangeRateNumer: string
  exchangeRateDenom: string
  paused: boolean
  depositFeeBps: number
  withdrawFeeBps: number
}

export interface PreviewInfo {
  shares: string
  assets: string
  fee: string
}

export type TxStatus = "idle" | "building" | "signing" | "submitting" | "pending" | "success" | "failed"

export interface TxState {
  status: TxStatus
  hash?: string
  error?: string
  message?: string
}

export interface StakedPosition {
  stXlmBalance: string
  xlmBalance: string
  xlmStaked: string
  exchangeRate: number
}

export interface AnalyticsData {
  tvl: string
  apy: string
  totalSupply: string
  exchangeRate: string
  totalStakers: number
  protocolRevenue: string
  todaysYield: string
}

export interface Transaction {
  id: string
  type: "stake" | "unstake" | "yield" | "fee"
  amount: string
  asset: string
  timestamp: string
  hash: string
  status: "success" | "failed" | "pending"
}

export interface WalletInfo {
  address: string
  network: string
  walletId: string
  walletName: string
}
