"use client";

import { useState, useCallback } from "react";
import { buildPaymentXdr, submitSignedTransaction } from "../lib/transactions";
import { config } from "../lib/stellar";
import type { TransactionState } from "../types";

export function useTransaction() {
  const [state, setState] = useState<TransactionState>({
    status: "idle",
    hash: null,
    error: null,
  });

  const send = useCallback(
    async (
      sourceAddress: string,
      destinationAddress: string,
      amount: string,
      signFn: (xdr: string, passphrase: string) => Promise<string>
    ) => {
      setState({ status: "building", hash: null, error: null });

      try {
        const xdr = await buildPaymentXdr(
          sourceAddress,
          destinationAddress,
          amount
        );

        setState({ status: "signing", hash: null, error: null });

        const signedXdr = await signFn(xdr, config.networkPassphrase);

        setState({ status: "submitting", hash: null, error: null });

        const result = await submitSignedTransaction(signedXdr);

        setState({
          status: "success",
          hash: result.hash,
          error: null,
        });

        return result.hash;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Transaction failed";
        setState({ status: "error", hash: null, error: message });
        throw err;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ status: "idle", hash: null, error: null });
  }, []);

  return { ...state, send, reset };
}
