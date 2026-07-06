import { cn } from "@/lib/utils"

interface SubheadingProps {
  children: React.ReactNode
  className?: string
}

export function Subheading({ children, className }: SubheadingProps) {
  return (
    <p className={cn("text-base font-bold tracking-wide text-zinc-400", className)}>
      {children}
    </p>
  )
}
