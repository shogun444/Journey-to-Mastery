"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import type { Token } from "@/types"
import { CaretDown, Check } from "@phosphor-icons/react"

interface TokenSelectProps {
  tokens: Token[]
  selected: Token | null
  balance?: string
  onSelect: (token: Token) => void
  label: string
}

export function TokenSelect({ tokens, selected, onSelect, label }: TokenSelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <div className="rounded-xl bg-[var(--glass)] p-[1px] ring-1 ring-[var(--glass-border)] transition-all duration-300 focus-within:ring-blue-500/40">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-2 rounded-[calc(0.75rem-1px)] bg-gradient-to-b from-[var(--glass-gradient)] to-transparent px-3 py-2.5 text-left transition-all duration-300"
        >
          <span className="text-lg">{selected?.icon ?? "⟐"}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--glass-text)]">{selected?.code ?? "Select token"}</p>
            {selected && <p className="text-xs text-zinc-500">{selected.name}</p>}
          </div>
          <CaretDown size={13} className="text-zinc-500 transition-transform duration-300" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl bg-[var(--glass)] p-[1px] shadow-[var(--shadow-ambient)] ring-1 ring-[var(--glass-border)]"
            >
              <div className="rounded-[calc(2rem-1px)] bg-gradient-to-b from-[var(--color-surface-elevated)] to-[var(--color-surface-elevated)] py-1.5">
                <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">{label}</p>
                {tokens.map((token) => (
                  <button
                    key={`${token.code}-${token.issuer}`}
                    type="button"
                    onClick={() => {
                      onSelect(token)
                      setOpen(false)
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-[var(--glass-hover)]"
                  >
                    <span className="text-lg">{token.icon ?? "⟐"}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-[var(--glass-text)]">{token.code}</p>
                      <p className="text-xs text-zinc-500">{token.name}</p>
                    </div>
                    {selected?.code === token.code && (
                      <Check size={15} className="text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
