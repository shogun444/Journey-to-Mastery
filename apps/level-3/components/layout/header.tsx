import { ConnectButton } from "@/components/wallet/connect-button"
import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-emerald-400 font-mono text-lg font-bold">st</span>
            <span className="text-zinc-100 font-semibold">XLM</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
              Dashboard
            </Link>
            <Link href="/stake" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
              Stake
            </Link>
            <Link href="/unstake" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
              Unstake
            </Link>
            <Link href="/analytics" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
              Analytics
            </Link>
            <Link href="/transactions" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
              Transactions
            </Link>
          </nav>
        </div>
        <ConnectButton />
      </div>
    </header>
  )
}
