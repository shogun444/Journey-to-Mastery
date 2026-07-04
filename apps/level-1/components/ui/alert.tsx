import { cn } from "../../lib/utils";
import {
  WarningCircle,
  CheckCircle,
  Info,
  X,
} from "@phosphor-icons/react";

type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  className?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}

const variantStyles: Record<AlertVariant, string> = {
  error:
    "border-danger/30 bg-danger/5 text-danger",
  success:
    "border-success/30 bg-success/5 text-success",
  warning:
    "border-warning/30 bg-warning/5 text-warning",
  info:
    "border-accent/30 bg-accent/5 text-accent",
};

const iconMap: Record<AlertVariant, React.ReactNode> = {
  error: <WarningCircle size={16} weight="bold" />,
  success: <CheckCircle size={16} weight="bold" />,
  warning: <WarningCircle size={16} weight="bold" />,
  info: <Info size={16} weight="bold" />,
};

export function Alert({
  variant = "info",
  className,
  children,
  onDismiss,
}: AlertProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs leading-relaxed",
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <span className="mt-0.5 shrink-0">{iconMap[variant]}</span>
      <span className="flex-1">{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
