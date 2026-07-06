import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const variantStyles = {
  primary:
    "bg-blue-500 text-white hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(59,130,246,0.25)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.35)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]",
  secondary:
    "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed border border-[var(--color-border)]",
  ghost:
    "bg-transparent text-zinc-500 hover:bg-[var(--color-surface-hover)] hover:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed",
  danger:
    "bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-40 disabled:cursor-not-allowed ring-1 ring-red-500/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
}

const sizeStyles = {
  sm: "h-9 px-4 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-11 px-6 text-sm",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]",
          variantStyles[variant],
          sizeStyles[size],
          loading && "animate-pulse",
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
