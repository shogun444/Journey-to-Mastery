import { cn } from "@/lib/utils"

interface SubheadingProps {
  children: React.ReactNode
  className?: string
}

export function Subheading({ children, className }: SubheadingProps) {
  return (
    <p className={cn("text-lg font-semibold text-neutral-400 leading-tight", className)}>
      {children}
    </p>
  )
}
