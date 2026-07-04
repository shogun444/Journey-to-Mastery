"use client";

import { useEffect, useCallback } from "react";
import { useFreighter } from "../../hooks/useFreighter";
import { useBalance } from "../../hooks/useBalance";
import { Card } from "../ui/card";
import { Text } from "../ui/text";
import { Alert } from "../ui/alert";
import { Spinner } from "../ui/spinner";
import { CurrencyCircleDollar, ArrowClockwise } from "@phosphor-icons/react";

export function BalanceDisplay() {
  const { address, connected } = useFreighter();
  const { balance, loading, error, refetch } = useBalance(
    connected ? address : null
  );

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (connected && address) {
      refetch();
    }
  }, [connected, address, refetch]);

  useEffect(() => {
    window.addEventListener("balance-refetch", handleRefetch);
    return () => window.removeEventListener("balance-refetch", handleRefetch);
  }, [handleRefetch]);

  if (!connected) return null;

  return (
    <Card title="Balance">
      <div className="flex items-center gap-3">
        <CurrencyCircleDollar
          size={24}
          className="text-accent shrink-0"
        />
        <div className="flex flex-col gap-1">
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" className="text-accent" />
              <Text variant="caption">Loading...</Text>
            </div>
          ) : error ? (
            <div className="space-y-1.5">
              <Alert variant="error">
                {error}
              </Alert>
              <button
                type="button"
                onClick={refetch}
                className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
              >
                <ArrowClockwise size={12} />
                Retry
              </button>
            </div>
          ) : (
            <>
              <Text variant="display" as="p">
                {parseFloat(balance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 7,
                })}
              </Text>
              <Text variant="caption">XLM</Text>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
