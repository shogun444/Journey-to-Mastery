import { cn } from "@/lib/utils"

interface SubheadingProps {
  children: React.ReactNode
  className?: string
}

export function Subheading({ children, className }: SubheadingProps) {
  return (
    <p className={cn("text-sm font-medium tracking-wide uppercase text-zinc-400", className)}>
      {children}
    </p>
  )
}
