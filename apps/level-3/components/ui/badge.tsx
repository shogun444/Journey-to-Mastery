import { cn } from "@/lib/utils"

interface BadgeProps {
  variant?: "default" | "success" | "error" | "warning"
  children: React.ReactNode
  className?: string
}

const variantStyles = {
  default: "bg-zinc-800 text-zinc-300",
  success: "bg-emerald-500/10 text-emerald-400",
  error: "bg-red-500/10 text-red-400",
  warning: "bg-amber-500/10 text-amber-400",
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
