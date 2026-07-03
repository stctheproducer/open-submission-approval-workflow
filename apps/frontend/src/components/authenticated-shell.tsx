import { type ReactNode, useMemo } from "react"
import { useNavigate } from "react-router"
import { LogOut } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { storeRole } from "@/lib/auth-session"
import { apiQuery } from "@/lib/query"
import type { Role } from "@/routing/access-policy"

type AuthenticatedShellProps = {
  role: Exclude<Role, null>
  onSignedOut?: () => void
  children: ReactNode
}

export function AuthenticatedShell({
  role,
  onSignedOut,
  children,
}: AuthenticatedShellProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logoutMutation = useMutation({
    ...apiQuery.profile.sessions.destroy.mutationOptions(),
    onSettled: () => {
      void queryClient.cancelQueries()
      queryClient.clear()
      storeRole(null)
      onSignedOut?.()
      navigate("/login", { replace: true })
    },
  })

  const roleLabel = useMemo(
    () => (role === "applicant" ? "Applicant workspace" : "Reviewer workspace"),
    [role]
  )

  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,_rgba(95,161,125,0.12),_transparent_28%),radial-gradient(circle_at_88%_18%,_rgba(124,139,168,0.08),_transparent_30%),linear-gradient(180deg,_var(--background)_0%,_color-mix(in_oklch,var(--background),var(--muted)_8%)_100%)]" />
      <header className="relative sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
              Application workspace
            </span>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              {roleLabel}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle fixed={false} />

            <Separator orientation="vertical" className="hidden h-8 sm:block" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full px-4"
              onClick={() => {
                logoutMutation.mutate()
              }}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              <span className="ml-1.5">
                {logoutMutation.isPending ? "Logging out" : "Logout"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
        {children}
      </div>
    </main>
  )
}
