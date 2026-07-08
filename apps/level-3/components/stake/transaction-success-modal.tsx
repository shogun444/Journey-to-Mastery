"use client"

import { Dialog } from "@/components/ui/dialog"
import { CheckCircle } from "@phosphor-icons/react"
import { STELLAR_EXPERT_URL } from "@/lib/stellar"

export interface SuccessDetails {
  type: "stake" | "unstake"
  inputAmount: string
  inputAsset: string
  outputAmount: string
  outputAsset: string
  rateLabel: string
  slippageTolerance: string
  networkFee: string
  hash: string
}

interface TransactionSuccessModalProps {
  open: boolean
  onClose: () => void
  details: SuccessDetails | null
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/40 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className={`text-sm font-mono font-medium ${accent ? "text-emerald-400" : "text-zinc-200"}`}>
        {value}
      </span>
    </div>
  )
}

export function TransactionSuccessModal({ open, onClose, details }: TransactionSuccessModalProps) {
  if (!details) return null

  const title = details.type === "stake" ? "Stake Successful" : "Unstake Successful"

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="flex flex-col items-center">
        <MotionCheck />
        <p className="text-sm text-zinc-400 mt-2 mb-5 text-center">
          Your transaction has been confirmed on the Stellar network.
        </p>

        <div className="w-full">
          <Row label={`${details.type === "stake" ? "Staked" : "Unstaked"}`} value={`${details.inputAmount} ${details.inputAsset}`} />
          <Row label="Received" value={`${details.outputAmount} ${details.outputAsset}`} accent />
          <Row label="Exchange rate" value={details.rateLabel} />
          <Row label="Slippage tolerance" value={details.slippageTolerance} />
          <Row label="Network fee" value={details.networkFee} />
        </div>

        <a
          href={`${STELLAR_EXPERT_URL}/tx/${details.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 w-full text-center py-2.5 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
        >
          View on StellarExpert
        </a>

        <button
          onClick={onClose}
          className="mt-3 w-full text-center py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Close
        </button>
      </div>
    </Dialog>
  )
}

function MotionCheck() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
      <CheckCircle size={64} weight="fill" className="relative text-emerald-400" />
    </div>
  )
}
