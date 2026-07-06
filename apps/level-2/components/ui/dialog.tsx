"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { X } from "@phosphor-icons/react"

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={cn(
              "relative w-full max-w-md rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-xl",
              className
            )}
          >
            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                {title && (
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
                )}
                <button
                  onClick={onClose}
                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-all duration-200 hover:bg-[var(--color-surface-hover)] hover:text-zinc-300"
                >
                  <X size={16} />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
