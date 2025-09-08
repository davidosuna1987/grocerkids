"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import { THEMES_MAP } from "@/types"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useSettings()

  const cycleTheme = () => {
    if (theme === THEMES_MAP.light) {
      setTheme(THEMES_MAP.dark)
    } else if (theme === THEMES_MAP.dark) {
      setTheme(THEMES_MAP.system)
    } else {
      setTheme(THEMES_MAP.light)
    }
  }

  const getIcon = () => {
    switch (theme) {
      case THEMES_MAP.light:
        return <Sun className="!size-6" />
      case THEMES_MAP.dark:
        return <Moon className="!size-6" />
      case THEMES_MAP.system:
        return <Monitor className="!size-6" />
      default:
        return <Sun className="!size-6" />
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="p-0 hover:bg-transparent text-foreground/70 hover:text-primary"
      onClick={cycleTheme}
    >
      {getIcon()}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
