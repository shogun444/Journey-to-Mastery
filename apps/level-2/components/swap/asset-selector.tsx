"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CaretDown, X } from "@phosphor-icons/react"
import type { Token } from "@/types"

interface AssetSelectorProps {
  tokens: Token[]
  selected: Token
  balances: Record<string, string>
  onSelect: (token: Token) => void
}

function getTokenBalance(token: Token, balances: Record<string, string>): string {
  if (token.code === "XLM") return balances["native"] ?? "0"
  const key = `${token.code}:${token.issuer}`
  return balances[key] ?? "0"
}

export function AssetSelector({ tokens, selected, balances, onSelect }: AssetSelectorProps) {
  const [open, setOpen] = useState(false)
  const currentBalance = getTokenBalance(selected, balances)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)]"
      >
        <span className="text-2xl">{selected.icon ?? "⟐"}</span>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{selected.code}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{selected.name}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm text-[var(--color-text-primary)]">
            {Number(currentBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">Balance</p>
        </div>
        <CaretDown size={14} className="text-[var(--color-text-muted)]" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Select Asset</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {tokens.map((token) => {
                  const bal = getTokenBalance(token, balances)
                  const isSelected = selected.code === token.code && selected.issuer === token.issuer
                  return (
                    <button
                      key={`${token.code}-${token.issuer}`}
                      type="button"
                      onClick={() => {
                        onSelect(token)
                        setOpen(false)
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                        isSelected
                          ? "bg-blue-500/10 ring-1 ring-blue-500/20"
                          : "hover:bg-[var(--color-surface-hover)]"
                      }`}
                    >
                      <span className="text-xl">{token.icon ?? "⟐"}</span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{token.code}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">{token.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-[var(--color-text-primary)]">
                          {Number(bal).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">Balance</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
