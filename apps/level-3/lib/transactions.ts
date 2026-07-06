import * as StellarSdk from "@stellar/stellar-sdk"
import { getRpc, getHorizon, config } from "./stellar"
import type { TxState } from "@/types"

export async function submitClassicTransaction(signedXdr: string): Promise<{ hash: string }> {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase
  ) as StellarSdk.Transaction

  const response = await getHorizon().submitTransaction(transaction)
  return { hash: response.hash }
}

export async function submitSorobanTransaction(signedXdr: string): Promise<{ hash: string }> {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase
  ) as StellarSdk.Transaction

  const response = await getRpc().sendTransaction(transaction)

  if (response.status === "ERROR") {
    throw new Error(`Transaction failed: ${response.errorResult}`)
  }

  let getResponse = await getRpc().getTransaction(response.hash)
  let retries = 0
  while (getResponse.status === "NOT_FOUND" && retries < 30) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    getResponse = await getRpc().getTransaction(response.hash)
    retries++
  }

  if (getResponse.status === "SUCCESS") {
    return { hash: response.hash }
  }

  throw new Error(`Transaction failed: ${getResponse.status}`)
}

export async function pollTransaction(hash: string, maxRetries = 30): Promise<TxState> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await getRpc().getTransaction(hash)
      if (response.status === "SUCCESS") {
        return { status: "success", hash }
      }
      if (response.status === "FAILED") {
        return { status: "failed", hash, error: "Transaction failed on chain" }
      }
    } catch {
      // not found yet
    }
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  return { status: "failed", hash, error: "Transaction timeout. Check StellarExpert." }
}
