import { cn } from "@/lib/utils"

interface HeadingProps {
  as?: "h1" | "h2" | "h3"
  children: React.ReactNode
  className?: string
}

const styles = {
  h1: "text-4xl md:text-5xl font-bold tracking-tight leading-tight",
  h2: "text-2xl md:text-3xl font-bold tracking-tight leading-snug",
  h3: "text-xl font-bold leading-snug",
}

export function Heading({ as: Tag = "h1", children, className }: HeadingProps) {
  return <Tag className={cn(styles[Tag], className)}>{children}</Tag>
}
