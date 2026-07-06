import { cn } from "@/lib/utils"
import { Subheading } from "./subheading"

interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[var(--glass)] p-[1px] shadow-[var(--shadow-card)] ring-1 ring-[var(--glass-border)]",
        className
      )}
    >
      <div className="rounded-[calc(2rem-1px)] bg-gradient-to-b from-[var(--glass-gradient)] to-transparent p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        {title && <Subheading>{title}</Subheading>}
        {children}
      </div>
    </div>
  )
}
