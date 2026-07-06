import { cn } from "@/lib/utils"

interface HeadingProps {
  as?: "h1" | "h2" | "h3"
  children: React.ReactNode
  className?: string
}

const styles = {
  h1: "text-3xl md:text-4xl font-bold tracking-tight leading-tight",
  h2: "text-xl md:text-2xl font-semibold tracking-tight leading-snug",
  h3: "text-lg font-medium leading-snug",
}

export function Heading({ as: Tag = "h1", children, className }: HeadingProps) {
  return <Tag className={cn(styles[Tag], className)}>{children}</Tag>
}
