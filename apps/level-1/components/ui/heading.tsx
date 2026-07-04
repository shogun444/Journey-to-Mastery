import { cn } from "../../lib/utils";

type HeadingLevel = "h1" | "h2" | "h3";

interface HeadingProps {
  as?: HeadingLevel;
  className?: string;
  children: React.ReactNode;
}

const sizeMap: Record<HeadingLevel, string> = {
  h1: "text-3xl md:text-4xl font-bold tracking-tight leading-tight text-fg",
  h2: "text-xl md:text-2xl font-semibold tracking-tight leading-snug text-fg",
  h3: "text-lg font-medium leading-snug text-fg",
};

export function Heading({ as: Tag = "h1", className, children }: HeadingProps) {
  return (
    <Tag className={cn(sizeMap[Tag], className)}>
      {children}
    </Tag>
  );
}
