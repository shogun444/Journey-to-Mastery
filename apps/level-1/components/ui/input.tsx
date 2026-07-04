"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Text } from "./text";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm text-fg-secondary font-medium"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-9 rounded-lg border bg-surface-elevated px-3 text-sm text-fg placeholder:text-fg-muted",
            "border-border focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50",
            "transition-colors duration-150",
            error && "border-danger focus:border-danger focus:ring-danger/50",
            className
          )}
          {...props}
        />
        {error && (
          <Text variant="caption" className="text-danger">
            {error}
          </Text>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
