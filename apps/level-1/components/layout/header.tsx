"use client";

import { useFreighter } from "../../hooks/useFreighter";
import { ConnectButton } from "../wallet/connect-button";
import { ThemeToggle } from "../ui/theme-toggle";
import { Badge } from "../ui/badge";
export function Header() {
  const { network } = useFreighter();
  const isTestnet = network?.toLowerCase().includes("test");

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-fg">
            Stellar Pay
          </span>
          {isTestnet && (
            <Badge variant="warning">Testnet</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
