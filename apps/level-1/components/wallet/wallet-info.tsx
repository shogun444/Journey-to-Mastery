"use client";

import { useFreighter } from "../../hooks/useFreighter";
import { Badge } from "../ui/badge";
import { Text } from "../ui/text";

export function WalletInfo() {
  const { address, network, connected } = useFreighter();

  if (!connected || !address) return null;

  const isTestnet = network?.toLowerCase().includes("test");
  const isMainnet = network?.toLowerCase().includes("pub");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Text variant="caption" as="span">Network:</Text>
        <Badge variant={isMainnet ? "warning" : "default"}>
          {isTestnet ? "Testnet" : isMainnet ? "Mainnet" : network ?? "Unknown"}
        </Badge>
      </div>
      <Text variant="mono" as="span" className="break-all">
        {address}
      </Text>
    </div>
  );
}
