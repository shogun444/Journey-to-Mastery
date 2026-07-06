import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { CaretDown } from "@phosphor-icons/react"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm text-zinc-500">
            {label}
          </label>
        )}
        <div
          className={cn(
            "rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] transition-all duration-300 focus-within:border-blue-500/40",
            error && "border-red-500/40"
          )}
        >
          <div className="relative">
            <select
              ref={ref}
              id={selectId}
              className={cn(
                "h-10 w-full appearance-none rounded-xl bg-transparent px-4 pr-10 text-sm text-[var(--color-text-primary)] outline-none",
                className
              )}
              {...props}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[var(--color-surface-elevated)]">
                  {opt.label}
                </option>
              ))}
            </select>
            <CaretDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={14}
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Select.displayName = "Select"
