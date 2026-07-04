"use client";

import { useState, useCallback, useMemo } from "react";
import { useFreighter } from "../../hooks/useFreighter";
import { useBalance } from "../../hooks/useBalance";
import { useTransaction } from "../../hooks/useTransaction";
import { fundWithFriendbot } from "../../lib/transactions";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Alert } from "../ui/alert";
import { Text } from "../ui/text";
import { Spinner } from "../ui/spinner";
import { TransactionLink } from "./transaction-link";
import {
  PaperPlaneTilt,
  Sparkle,
  ArrowClockwise,
  Wallet,
} from "@phosphor-icons/react";

const ADDRESS_REGEX = /^G[A-Z2-7]{55}$/;

export function SendPaymentForm() {
  const { connected, address, network, sign, error: walletError } = useFreighter();
  const { status, hash, error: txError, send, reset } = useTransaction();
  const { balance } = useBalance(connected ? address : null);

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [destError, setDestError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [friendbotLoading, setFriendbotLoading] = useState(false);
  const [friendbotAlert, setFriendbotAlert] = useState<{
    variant: "success" | "error";
    message: string;
  } | null>(null);

  const isTestnet = network?.toLowerCase().includes("test");

  const validateDestination = useCallback((value: string) => {
    if (!value) {
      setDestError(null);
      return;
    }
    setDestError(ADDRESS_REGEX.test(value) ? null : "Invalid Stellar address format");
  }, []);

  const validateAmount = useCallback((value: string) => {
    if (!value) {
      setAmountError(null);
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setAmountError("Must be a positive number");
      return;
    }
    setAmountError(null);
  }, []);

  const currentBalance = parseFloat(balance);
  const parsedAmount = parseFloat(amount);
  const insufficientBalance =
    connected &&
    !!address &&
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount > currentBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !destination || !amount) return;
    if (!ADDRESS_REGEX.test(destination) || parseFloat(amount) <= 0) return;
    if (insufficientBalance) return;

    try {
      await send(address, destination, amount, sign);
      window.dispatchEvent(new CustomEvent("balance-refetch"));
    } catch {
      // handled by hook
    }
  };

  const handleFriendbot = async () => {
    if (!address) return;
    setFriendbotLoading(true);
    setFriendbotAlert(null);
    try {
      await fundWithFriendbot(address);
      setFriendbotAlert({
        variant: "success",
        message: "Funded! 10,000 XLM sent to your account.",
      });
      window.dispatchEvent(new CustomEvent("balance-refetch"));
    } catch (err) {
      setFriendbotAlert({
        variant: "error",
        message: err instanceof Error ? err.message : "Funding failed",
      });
    } finally {
      setFriendbotLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setFriendbotAlert(null);
    setDestination("");
    setAmount("");
    setDestError(null);
    setAmountError(null);
  };

  const isProcessing =
    status === "building" || status === "signing" || status === "submitting";

  const canSend =
    connected &&
    !!address &&
    !!destination &&
    !!amount &&
    !destError &&
    !amountError &&
    !isProcessing &&
    !insufficientBalance;

  const loadingLabel = useMemo(() => {
    switch (status) {
      case "building":
        return "Building...";
      case "signing":
        return "Sign in Wallet...";
      case "submitting":
        return "Submitting...";
      default:
        return "Send";
    }
  }, [status]);

  const loadingDescription = useMemo(() => {
    switch (status) {
      case "building":
        return "Preparing your transaction on Stellar...";
      case "signing":
        return "Check your Freighter wallet to sign...";
      case "submitting":
        return "Sending to the Stellar network...";
      default:
        return null;
    }
  }, [status]);

  return (
    <Card title="Send XLM">
      {isTestnet && (
        <div className="mb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleFriendbot}
            loading={friendbotLoading}
            className="w-full"
          >
            <Sparkle size={14} />
            Get Testnet XLM (Friendbot)
          </Button>
          {friendbotAlert && (
            <div className="mt-2">
              <Alert
                variant={friendbotAlert.variant}
                onDismiss={() => setFriendbotAlert(null)}
              >
                {friendbotAlert.message}
              </Alert>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Destination Address"
          placeholder="G..."
          value={destination}
          onChange={(e) => {
            setDestination(e.target.value);
            validateDestination(e.target.value);
          }}
          onBlur={(e) => validateDestination(e.target.value)}
          error={destError ?? undefined}
          disabled={isProcessing || !connected}
        />

        <Input
          label="Amount (XLM)"
          type="number"
          step="any"
          min="0"
          placeholder="0.0"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            validateAmount(e.target.value);
          }}
          onBlur={(e) => validateAmount(e.target.value)}
          error={amountError ?? undefined}
          disabled={isProcessing || !connected}
        />

        {insufficientBalance && (
          <Alert variant="error">
            Insufficient funds. You have {currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 7 })} XLM.
          </Alert>
        )}

        {!connected && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Wallet size={16} className="text-fg-muted" />
            <Text variant="body" className="!text-fg-muted">
              Connect your wallet to send XLM
            </Text>
          </div>
        )}

        {walletError && (
          <Alert variant="error" onDismiss={() => {}}>
            {walletError}
          </Alert>
        )}

        {connected && (
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={!canSend}
            loading={isProcessing}
          >
            <PaperPlaneTilt size={14} />
            {loadingLabel}
          </Button>
        )}
      </form>

      {isProcessing && loadingDescription && (
        <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-border/50 bg-surface-elevated/50 px-3.5 py-2.5">
          <Spinner size="sm" className="text-accent" />
          <Text variant="caption" className="text-fg-secondary">
            {loadingDescription}
          </Text>
        </div>
      )}

      {status === "success" && hash && (
        <div className="mt-4 space-y-3">
          <Alert variant="success">
            Transaction confirmed
          </Alert>
          <Text variant="mono-sm" className="break-all">{hash}</Text>
          <TransactionLink hash={hash} />
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Send Another
          </Button>
        </div>
      )}

      {txError && (
        <div className="mt-4 space-y-3">
          <Alert
            variant="error"
            onDismiss={() => reset()}
          >
            {txError}
          </Alert>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <ArrowClockwise size={14} />
            Try Again
          </Button>
        </div>
      )}
    </Card>
  );
}
