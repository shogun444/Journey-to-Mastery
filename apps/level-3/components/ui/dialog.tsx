"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
          <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                  "w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl pointer-events-auto",
                  className,
                )}
              >
            <div className={`flex items-center justify-between ${title ? "mb-4" : "mb-0"}`}>
              <div className="min-w-0">
                {title && <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>}
              </div>
              <button
                onClick={onClose}
                className="ml-auto p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {children}
            </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
