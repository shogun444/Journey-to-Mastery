import * as StellarSdk from "@stellar/stellar-sdk"
import { rpc, horizon, config, AMM_CONTRACT_ID } from "./stellar"

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

export async function buildContractLogTx(
  sourceAddress: string,
  sourceCode: string,
  sourceIssuer: string,
  destCode: string,
  destIssuer: string,
  amountIn: string,
  amountOut: string
): Promise<string> {
  const account = await rpc.getAccount(sourceAddress)
  const seq = typeof account.sequenceNumber === "function" ? account.sequenceNumber() : account.sequenceNumber
  const stellarAccount = new StellarSdk.Account(sourceAddress, seq)

  const contract = new StellarSdk.Contract(AMM_CONTRACT_ID)

  const swapScVal = StellarSdk.nativeToScVal(
    {
      sender: sourceAddress,
      source_asset: sourceCode,
      source_issuer: sourceIssuer,
      dest_asset: destCode,
      dest_issuer: destIssuer,
      amount_in: BigInt(amountIn),
      amount_out: BigInt(amountOut),
    },
    {
      type: {
        sender: "address",
        source_asset: "string",
        source_issuer: "string",
        dest_asset: "string",
        dest_issuer: "string",
        amount_in: "i128",
        amount_out: "i128",
      },
    }
  )

  let tx = new StellarSdk.TransactionBuilder(stellarAccount, {
    fee: "100000",
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call("swap", swapScVal))
    .setTimeout(300)
    .build()

  const sim = await rpc.simulateTransaction(tx)

  if (StellarSdk.rpc.Api.isSimulationError(sim)) {
    throw new Error(`Contract simulation failed: ${sim.error}`)
  }

  tx = StellarSdk.rpc.assembleTransaction(tx, sim).build()
  return tx.toXDR()
}

export async function submitContractLog(signedXdr: string): Promise<{ hash: string }> {
  const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, config.networkPassphrase) as StellarSdk.Transaction
  const response = await rpc.sendTransaction(tx)

  if (response.status === "ERROR") {
    throw new Error("Contract call transaction failed")
  }

  let getResponse = await rpc.getTransaction(response.hash)
  while (getResponse.status === "NOT_FOUND") {
    await new Promise((r) => setTimeout(r, 1000))
    getResponse = await rpc.getTransaction(response.hash)
  }

  if (getResponse.status !== "SUCCESS") {
    throw new Error("Contract call tx not confirmed")
  }

  return { hash: response.hash }
}

export function getStellarExpertUrl(hash: string): string {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet"
  const base = network === "testnet" ? "https://stellar.expert/explorer/testnet" : "https://stellar.expert/explorer/public"
  return `${base}/tx/${hash}`
}
