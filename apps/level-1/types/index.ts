export interface WalletState {
  connected: boolean;
  address: string | null;
  network: string | null;
}

export interface BalanceState {
  balance: string;
  loading: boolean;
  error: string | null;
}

export interface TransactionState {
  status: "idle" | "building" | "signing" | "submitting" | "success" | "error";
  hash: string | null;
  error: string | null;
}

export interface StellarConfig {
  horizonUrl: string;
  networkPassphrase: string;
  friendbotUrl: string;
}

export type HorizonBalance = {
  asset_type: string;
  balance: string;
  asset_code?: string;
  asset_issuer?: string;
};
