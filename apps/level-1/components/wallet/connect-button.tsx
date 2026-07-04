"use client";

import { useState } from "react";
import { useFreighter } from "../../hooks/useFreighter";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Alert } from "../ui/alert";
import { Wallet, SignOut, ArrowSquareOut } from "@phosphor-icons/react";

export function ConnectButton() {
  const { connected, address, connect, disconnect, error, installed } = useFreighter();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connect();
    } catch {
      // handled by hook
    } finally {
      setConnecting(false);
    }
  };

  if (!installed) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <Alert variant="error" className="max-w-[220px]">
          Freighter not detected.
        </Alert>
        <a
          href="https://www.freighter.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
        >
          <ArrowSquareOut size={12} />
          Install Freighter
        </a>
      </div>
    );
  }

  if (connected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <Text variant="mono" className="text-fg-secondary" as="span">
            {address.slice(0, 4)}...{address.slice(-4)}
          </Text>
        </div>
        <Button variant="ghost" size="sm" onClick={disconnect}>
          <SignOut size={14} />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        variant="primary"
        size="sm"
        onClick={handleConnect}
        loading={connecting}
      >
        <Wallet size={14} />
        Connect Wallet
      </Button>
      {error && (
        <Alert variant="error" className="max-w-[220px]">
          {error}
        </Alert>
      )}
    </div>
  );
}
