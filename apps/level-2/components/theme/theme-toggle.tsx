"use client"

import { useTheme } from "@/app/providers"
import { motion } from "motion/react"
import { SunDim, Moon } from "@phosphor-icons/react"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition-all duration-200 hover:bg-[var(--color-surface-hover)] hover:text-zinc-300"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <SunDim size={13} /> : <Moon size={13} />}
    </motion.button>
  )
}
