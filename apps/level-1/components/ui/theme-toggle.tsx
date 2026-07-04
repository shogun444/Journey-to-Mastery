"use client";

import { useTheme } from "../../hooks/useTheme";
import { Button } from "./button";
import { Sun, Moon } from "@phosphor-icons/react";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
    </Button>
  );
}
