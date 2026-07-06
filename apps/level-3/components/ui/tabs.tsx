"use client"

import { cn } from "@/lib/utils"

interface TabsProps {
  value: string
  onChange: (value: string) => void
  tabs: { value: string; label: string }[]
  className?: string
}

export function Tabs({ value, onChange, tabs, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 p-1 rounded-lg bg-zinc-800/50", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-all duration-150",
            value === tab.value
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
