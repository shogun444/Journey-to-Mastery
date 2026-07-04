import { cn } from "../../lib/utils";

type TextVariant = "body" | "caption" | "mono" | "mono-sm" | "display";

interface TextProps {
  variant?: TextVariant;
  className?: string;
  children: React.ReactNode;
  as?: "p" | "span" | "div";
}

const variantStyles: Record<TextVariant, string> = {
  body: "text-sm text-fg-secondary leading-relaxed",
  caption: "text-xs text-fg-muted",
  mono: "text-sm font-mono text-fg",
  "mono-sm": "text-xs font-mono text-fg-muted",
  display: "text-2xl md:text-3xl font-mono font-semibold text-fg",
};

export function Text({
  variant = "body",
  className,
  children,
  as: Tag = "p",
}: TextProps) {
  return (
    <Tag className={cn(variantStyles[variant], className)}>
      {children}
    </Tag>
  );
}
