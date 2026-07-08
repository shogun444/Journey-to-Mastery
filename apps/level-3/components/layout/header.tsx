"use client"

import { useState } from "react"
import { ConnectButton } from "@/components/wallet/connect-button"
import Link from "next/link"
import { List, X } from "@phosphor-icons/react"

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/stake", label: "Stake" },
  { href: "/unstake", label: "Unstake" },
  { href: "/analytics", label: "Analytics" },
  { href: "/transactions", label: "Transactions" },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setMenuOpen(false)}>
            <span className="text-emerald-400 font-mono text-lg font-bold">st</span>
            <span className="text-zinc-100 font-semibold">XLM</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
            <ConnectButton />
          </div>
          <button
            className="md:hidden p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-md px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors py-1"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-zinc-800/50">
            <ConnectButton />
          </div>
        </div>
      )}
    </header>
  )
}
