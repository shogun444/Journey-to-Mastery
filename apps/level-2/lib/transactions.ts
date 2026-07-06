import * as StellarSdk from "@stellar/stellar-sdk"
import { rpc, horizon, config } from "./stellar"

function isClassicTx(transaction: StellarSdk.Transaction | StellarSdk.FeeBumpTransaction): boolean {
  if (transaction instanceof StellarSdk.FeeBumpTransaction) return false
  return (transaction as StellarSdk.Transaction).operations.every(
    (op) => op.type !== "invokeHostFunction"
  )
}

export async function buildSwapTx(
  sourceAddress: string,
  sourceAsset: StellarSdk.Asset,
  destAsset: StellarSdk.Asset,
  amount: string,
  minAmountOut: string,
  path: StellarSdk.Asset[]
): Promise<string> {
  const account = await horizon.loadAccount(sourceAddress)

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.pathPaymentStrictSend({
        sendAsset: sourceAsset,
        sendAmount: amount,
        destination: sourceAddress,
        destAsset: destAsset,
        destMin: minAmountOut,
        path,
      })
    )
    .setTimeout(300)
    .build()

  return transaction.toXDR()
}

export async function submitTransaction(signedXdr: string): Promise<{ hash: string; status: string }> {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(signedXdr, config.networkPassphrase)

  if (isClassicTx(transaction)) {
    return submitClassic(signedXdr)
  }

  return submitSoroban(signedXdr)
}

async function submitClassic(signedXdr: string): Promise<{ hash: string; status: string }> {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase
  ) as StellarSdk.Transaction

  const result = await horizon.submitTransaction(transaction)
  return { hash: result.hash, status: "success" }
}

async function submitSoroban(signedXdr: string): Promise<{ hash: string; status: string }> {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase
  ) as StellarSdk.Transaction

  const sendResponse = await rpc.sendTransaction(transaction)

  if (sendResponse.status === "ERROR") {
    throw new Error(`Transaction failed: ${sendResponse.errorResult?.result().toString() ?? "Unknown error"}`)
  }

  let getResponse = await rpc.getTransaction(sendResponse.hash)
  while (getResponse.status === "NOT_FOUND") {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    getResponse = await rpc.getTransaction(sendResponse.hash)
  }

  if (getResponse.status === "SUCCESS") {
    return { hash: sendResponse.hash, status: "success" }
  }

  return { hash: sendResponse.hash, status: "failed" }
}

export function getStellarExpertUrl(hash: string): string {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet"
  const base = network === "testnet" ? "https://stellar.expert/explorer/testnet" : "https://stellar.expert/explorer/public"
  return `${base}/tx/${hash}`
}
