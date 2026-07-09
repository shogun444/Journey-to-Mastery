"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { WarningCircle, CopySimple, Check, ArrowSquareOut } from "@phosphor-icons/react"
import { XLM_SAC } from "@/lib/stellar"
import { cn } from "@/lib/utils"

interface TrustlineCardProps {
  className?: string
}

export function TrustlineCard({ className }: TrustlineCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(XLM_SAC)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silent
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn("p-4 border-amber-500/30 bg-amber-500/5", className)}>
        <div className="flex items-start gap-3">
          <WarningCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-3 min-w-0">
            <div>
              <p className="text-sm font-medium text-amber-300">Trustline Required</p>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Your account needs a trustline for the Stellar Asset Contract (SAC) before you can stake XLM.
                Add the contract ID below as a trustline via Stellar Laboratory.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-700/50 rounded-lg px-3 py-2.5">
              <code className="flex-1 text-xs font-mono text-zinc-300 truncate">{XLM_SAC}</code>
              <button
                onClick={handleCopy}
                className="shrink-0 p-1.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                aria-label="Copy contract ID"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <CopySimple size={16} />}
              </button>
            </div>

            <a
              href="https://laboratory.stellar.org/#txbuilder?network=testnet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors w-fit"
            >
              <ArrowSquareOut size={14} />
              Open Stellar Laboratory
            </a>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
