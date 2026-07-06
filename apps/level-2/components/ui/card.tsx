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
        "rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-5",
        className
      )}
    >
      {title && <Subheading>{title}</Subheading>}
      {children}
    </div>
  )
}
