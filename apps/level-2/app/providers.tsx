"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface ThemeContextType {
  theme: "dark" | "light"
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({ theme: "dark", toggleTheme: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "dark" | "light" | null
    if (stored === "light" || stored === "dark") {
      setTheme(stored)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    root.classList.toggle("light", theme === "light")
    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
