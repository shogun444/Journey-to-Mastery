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
            "rounded-xl bg-[var(--glass)] p-[1px] ring-1 transition-all duration-300",
            error ? "ring-red-500/40" : "ring-[var(--glass-border)] focus-within:ring-blue-500/40 focus-within:shadow-[var(--shadow-glow-blue)]"
          )}
        >
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-10 w-full rounded-[calc(0.75rem-1px)] bg-gradient-to-b from-[var(--glass-gradient)] to-transparent px-4 text-sm text-[var(--glass-text)] placeholder:text-zinc-500 outline-none transition-all duration-300",
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
