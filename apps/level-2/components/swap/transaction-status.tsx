"use client"

import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { getStellarExpertUrl } from "@/lib/transactions"
import type { TxState } from "@/types"
import { CheckCircle, XCircle, Spinner, ArrowSquareOut, X } from "@phosphor-icons/react"

interface TransactionStatusProps {
  txState: TxState
  onDismiss: () => void
}

export function TransactionStatus({ txState, onDismiss }: TransactionStatusProps) {
  if (txState.status === "idle") return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -12, height: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className={cn(
          "overflow-hidden rounded-2xl bg-[var(--glass)] p-[1px] shadow-[var(--shadow-card)]",
          txState.status === "success" && "ring-1 ring-emerald-500/20",
          txState.status === "failed" && "ring-1 ring-red-500/20",
          (txState.status === "building" || txState.status === "signing" || txState.status === "submitting" || txState.status === "pending") &&
            "ring-1 ring-amber-500/20"
        )}
      >
        <div className={cn(
          "rounded-[calc(2rem-1px)] bg-gradient-to-b from-[var(--glass-gradient)] to-transparent px-4 py-3.5",
          txState.status === "success" && "shadow-[inset_0_1px_1px_rgba(16,185,129,0.08)]",
          txState.status === "failed" && "shadow-[inset_0_1px_1px_rgba(239,68,68,0.08)]",
          (txState.status === "building" || txState.status === "signing" || txState.status === "submitting" || txState.status === "pending") &&
            "shadow-[inset_0_1px_1px_rgba(245,158,11,0.08)]"
        )}>
          <div className="flex items-start gap-3">
            {txState.status === "success" && (
              <CheckCircle size={18} className="mt-0.5 shrink-0 text-emerald-400" />
            )}
            {txState.status === "failed" && (
              <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
            )}
            {(txState.status === "building" || txState.status === "signing" || txState.status === "submitting" || txState.status === "pending") && (
              <Spinner size={18} className="mt-0.5 shrink-0 animate-spin text-amber-400" />
            )}

            <div className="flex-1">
              <p className={cn(
                "text-sm font-medium",
                txState.status === "success" && "text-emerald-400",
                txState.status === "failed" && "text-red-400",
                "text-amber-400"
              )}>
                {txState.status === "success" && "Transaction Confirmed"}
                {txState.status === "failed" && "Transaction Failed"}
                {(txState.status === "building" || txState.status === "signing" || txState.status === "submitting" || txState.status === "pending") && "Processing..."}
              </p>

              {txState.message && (
                <p className="mt-1 text-xs text-zinc-500">{txState.message}</p>
              )}

              {txState.error && (
                <p className="mt-1 text-xs text-red-400/80">{txState.error}</p>
              )}

              {txState.hash && (
                <a
                  href={getStellarExpertUrl(txState.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-blue-400/80 transition-colors duration-200 hover:text-blue-300"
                >
                  View on StellarExpert
                  <ArrowSquareOut size={11} />
                </a>
              )}
            </div>

            {(txState.status === "success" || txState.status === "failed") && (
              <button
                onClick={onDismiss}
                className="shrink-0 rounded-lg p-1 text-zinc-600 transition-all duration-200 hover:bg-[var(--glass-hover)] hover:text-zinc-300"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
