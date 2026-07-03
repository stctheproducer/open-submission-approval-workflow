import { Monitor, Moon, Sun } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const THEME_ORDER = ["light", "system", "dark"] as const

type ThemeToggleProps = {
  className?: string
  fixed?: boolean
}

export function ThemeToggle({ className, fixed = true }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const currentTheme = theme === "system" ? "system" : theme
  const label =
    currentTheme === "light"
      ? "Light theme"
      : currentTheme === "dark"
        ? "Dark theme"
        : "System theme"
  const Icon = currentTheme === "light" ? Sun : currentTheme === "dark" ? Moon : Monitor

  return (
    <button
      type="button"
      aria-label={`Switch theme, current ${label.toLowerCase()}`}
      onClick={() => {
        const currentIndex = THEME_ORDER.indexOf(theme)
        const nextTheme = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length]
        setTheme(nextTheme)
      }}
      className={cn(
        fixed
          ? "fixed right-6 top-6 z-50 inline-flex size-10 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 sm:right-10 sm:top-10 lg:right-12 lg:top-12"
          : "inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30",
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  )
}
