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

export const horizon = new StellarSdk.Horizon.Server(config.horizonUrl)
export const rpc = new StellarSdk.rpc.Server(config.rpcUrl)

export const STELLAR_EXPERT_URL =
  NETWORK === "testnet" ? "https://stellar.expert/explorer/testnet" : "https://stellar.expert/explorer/public"

export const AMM_CONTRACT_ID = "CCKWIHACAVZC5OBGR7W2HL43KKOYYCL3XZJD5APOUFYBWMBS2FZXWYAF"
