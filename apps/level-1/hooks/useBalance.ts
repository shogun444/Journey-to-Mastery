"use client";

import { useState, useEffect, useCallback } from "react";
import { horizon } from "../lib/stellar";
import type { BalanceState, HorizonBalance } from "../types";

export function useBalance(address: string | null) {
  const [state, setState] = useState<BalanceState>({
    balance: "0",
    loading: false,
    error: null,
  });

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setState({ balance: "0", loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const account = await horizon.loadAccount(address);
      const nativeBalance = (account.balances as HorizonBalance[]).find(
        (b) => b.asset_type === "native"
      );
      const balance = nativeBalance?.balance ?? "0";
      setState({ balance, loading: false, error: null });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { status?: number } }).response === "object" &&
        (err as { response: { status?: number } }).response?.status === 404
      ) {
        setState({ balance: "0", loading: false, error: null });
        return;
      }

      const message =
        err instanceof Error ? err.message : "Failed to fetch balance";
      setState({ balance: "0", loading: false, error: message });
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { ...state, refetch: fetchBalance };
}
