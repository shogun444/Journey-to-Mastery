import * as StellarSdk from "@stellar/stellar-sdk";
import type { StellarConfig } from "../types";

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";

export const config: StellarConfig = (() => {
  switch (NETWORK) {
    case "testnet":
      return {
        horizonUrl: "https://horizon-testnet.stellar.org",
        networkPassphrase: StellarSdk.Networks.TESTNET,
        friendbotUrl: "https://friendbot.stellar.org",
      };
    case "mainnet":
      return {
        horizonUrl: "https://horizon.stellar.org",
        networkPassphrase: StellarSdk.Networks.PUBLIC,
        friendbotUrl: "",
      };
    default:
      throw new Error(`Unknown STELLAR_NETWORK: ${NETWORK}`);
  }
})();

export const horizon = new StellarSdk.Horizon.Server(config.horizonUrl);
