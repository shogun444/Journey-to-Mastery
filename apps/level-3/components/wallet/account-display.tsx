"use client"

import { cn } from "@/lib/utils"

interface AccountDisplayProps {
  address: string
  className?: string
}

export function AccountDisplay({ address, className }: AccountDisplayProps) {
  return (
    <span className={cn("font-mono text-sm text-zinc-300", className)}>
      {address.slice(0, 4)}...{address.slice(-4)}
    </span>
  )
}
