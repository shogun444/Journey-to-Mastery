import { cn } from "../../lib/utils";

type BadgeVariant = "default" | "success" | "error" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-elevated text-fg-secondary",
  success: "bg-success/10 text-success",
  error: "bg-danger/10 text-danger",
  warning: "bg-warning/10 text-warning",
};

export function Badge({
  variant = "default",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
