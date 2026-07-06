import * as StellarSdk from "@stellar/stellar-sdk"

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet"

export const config = {
  testnet: {
    horizonUrl: "https://horizon-testnet.stellar.org",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: StellarSdk.Networks.TESTNET,
    friendbotUrl: "https://friendbot.stellar.org",
  },
  mainnet: {
    horizonUrl: "https://horizon.stellar.org",
    rpcUrl: process.env.NEXT_PUBLIC_STELLAR_MAINNET_RPC_URL ?? "https://horizon.stellar.org",
    networkPassphrase: StellarSdk.Networks.PUBLIC,
    friendbotUrl: null,
  },
}[NETWORK]!

let _horizon: StellarSdk.Horizon.Server | null = null
let _rpc: StellarSdk.rpc.Server | null = null

export function getHorizon() {
  if (!_horizon) {
    _horizon = new StellarSdk.Horizon.Server(config.horizonUrl)
  }
  return _horizon
}

export function getRpc() {
  if (!_rpc) {
    _rpc = new StellarSdk.rpc.Server(config.rpcUrl)
  }
  return _rpc
}

export const STELLAR_EXPERT_URL =
  NETWORK === "testnet" ? "https://stellar.expert/explorer/testnet" : "https://stellar.expert/explorer/public"

export const STXLM_CONTRACT_ID =
  process.env.NEXT_PUBLIC_STXLM_CONTRACT_ID ?? "CDLVFCJFKYQX4LO2CUVAWF3A5ENHNX3K6552KRFDEF36IIHORDEIVO7W"

export const VAULT_CONTRACT_ID =
  process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID ?? "CBJHCW2ENU2TEGY6CNCFKRR4UZL6K7XUT3SS3O55NCKBK4IVRDUXXAJS"

export const XLM_SAC_TESTNET = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
export const XLM_SAC_PUBNET = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75"
export const XLM_SAC = NETWORK === "testnet" ? XLM_SAC_TESTNET : XLM_SAC_PUBNET
