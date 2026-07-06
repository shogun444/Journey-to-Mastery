import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm text-zinc-500">
            {label}
          </label>
        )}
        <div
          className={cn(
            "rounded-xl bg-[var(--color-surface-elevated)] border transition-all duration-300",
            error ? "border-red-500/40" : "border-[var(--color-border)] focus-within:border-blue-500/40"
          )}
        >
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-10 w-full rounded-xl bg-transparent px-4 text-sm text-[var(--color-text-primary)] placeholder:text-zinc-500 outline-none transition-all duration-300",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"
