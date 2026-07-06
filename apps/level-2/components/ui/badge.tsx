import { cn } from "@/lib/utils"

interface BadgeProps {
  variant?: "default" | "success" | "error" | "warning"
  children: React.ReactNode
  className?: string
}

const variantStyles = {
  default: "bg-[var(--color-surface-elevated)] text-zinc-500 border border-[var(--color-border)]",
  success: "bg-emerald-500/8 text-emerald-400 ring-1 ring-emerald-500/15",
  error: "bg-red-500/8 text-red-400 ring-1 ring-red-500/15",
  warning: "bg-amber-500/8 text-amber-400 ring-1 ring-amber-500/15",
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
