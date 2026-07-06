import { cn } from "@/lib/utils"
import { Subheading } from "./subheading"

interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={cn("rounded-xl bg-zinc-900/80 border border-zinc-800/50 p-5", className)}>
      {title && <Subheading>{title}</Subheading>}
      {children}
    </div>
  )
}
