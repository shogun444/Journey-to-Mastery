"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isConnected,
  getAddress,
  requestAccess,
  signTransaction,
  getNetwork,
} from "@stellar/freighter-api";
import type { WalletState } from "../types";

export function useFreighter() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    network: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [installed, setInstalled] = useState<boolean>(true);

  const checkConnection = useCallback(async () => {
    try {
      const { isConnected: connected, error: connError } = await isConnected();
      if (connError || !connected) {
        setInstalled(false);
        return;
      }

      setInstalled(true);

      const { address: addr, error: addrError } = await getAddress();
      if (addrError || !addr) return;

      const { network: net, error: netError } = await getNetwork();
      if (netError) return;

      setWallet({ connected: true, address: addr, network: net });
    } catch {
      setInstalled(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connect = useCallback(async () => {
    setError(null);

    try {
      const { isConnected: connected, error: connError } = await isConnected();
      if (connError || !connected) {
        setInstalled(false);
        throw new Error("Freighter extension not installed or not available");
      }

      const { address: addr, error: accessError } = await requestAccess();
      if (accessError) {
        throw new Error(accessError);
      }

      const { network: net, error: netError } = await getNetwork();
      if (netError) {
        throw new Error(netError);
      }

      setWallet({ connected: true, address: addr, network: net });
      return addr;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setError(message);
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({ connected: false, address: null, network: null });
    setError(null);
  }, []);

  const sign = useCallback(
    async (xdr: string, networkPassphrase: string) => {
      if (!wallet.connected || !wallet.address) {
        throw new Error("Wallet not connected");
      }

      const { signedTxXdr, error: signError } = await signTransaction(xdr, {
        networkPassphrase,
      });

      if (signError) {
        throw new Error(signError);
      }

      return signedTxXdr;
    },
    [wallet.connected, wallet.address]
  );

  return {
    ...wallet,
    installed,
    error,
    connect,
    disconnect,
    sign,
  };
}
