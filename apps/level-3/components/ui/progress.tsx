import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number
  max?: number
  variant?: "default" | "success"
  className?: string
}

export function Progress({ value, max = 100, variant = "default", className }: ProgressProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn("h-1.5 bg-zinc-800 rounded-full overflow-hidden", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          variant === "success" ? "bg-emerald-500" : "bg-blue-500",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
