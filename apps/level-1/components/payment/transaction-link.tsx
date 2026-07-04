import { cn } from "../../lib/utils";
import { ArrowSquareOut } from "@phosphor-icons/react";

interface TransactionLinkProps {
  hash: string;
  className?: string;
}

function getExplorerUrl(hash: string): string {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";
  const base =
    network === "mainnet"
      ? "https://stellar.expert/explorer/public"
      : "https://stellar.expert/explorer/testnet";
  return `${base}/tx/${hash}`;
}

export function TransactionLink({ hash, className }: TransactionLinkProps) {
  const url = getExplorerUrl(hash);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:text-accent-hover underline underline-offset-2 transition-colors",
        className
      )}
    >
      <ArrowSquareOut size={12} />
      View on StellarExpert
    </a>
  );
}
