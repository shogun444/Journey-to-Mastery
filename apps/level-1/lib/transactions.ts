import * as StellarSdk from "@stellar/stellar-sdk";
import { horizon, config } from "./stellar";

export async function buildPaymentXdr(
  sourceAddress: string,
  destinationAddress: string,
  amount: string
): Promise<string> {
  const account = await horizon.loadAccount(sourceAddress);

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: destinationAddress,
        asset: StellarSdk.Asset.native(),
        amount,
      })
    )
    .setTimeout(180)
    .build();

  return transaction.toXDR();
}

export async function submitSignedTransaction(
  signedXdr: string
): Promise<{ hash: string; ledger: number }> {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase
  ) as StellarSdk.Transaction;

  const response = await horizon.submitTransaction(transaction);

  return {
    hash: response.hash,
    ledger: response.ledger,
  };
}

export async function fundWithFriendbot(address: string): Promise<void> {
  const response = await fetch(
    `${config.friendbotUrl}?addr=${address}`
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Friendbot funding failed: ${body}`);
  }
}
