import { ArrowLeft, Home, Search } from "lucide-react"
import { useNavigate } from "react-router"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useSetPageMeta } from "@/routing/page-meta"

const NOT_FOUND_PAGE_META = {
  title: "Page unavailable",
  description:
    "The page you requested could not be found. Return to the application workspace or sign in again.",
  robots: "noindex, nofollow",
} as const

export function NotFoundPage() {
  const navigate = useNavigate()

  useSetPageMeta(NOT_FOUND_PAGE_META)

  return (
    <main className="min-h-svh bg-background text-foreground">
      <ThemeToggle />
      <div className="grid min-h-svh place-items-center px-4 py-10 sm:px-6 lg:px-8">
        <Card className="relative w-full max-w-3xl overflow-hidden rounded-none border border-border bg-card shadow-sm">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />
          <CardHeader className="gap-4 px-6 pt-8 pb-0 sm:px-10 sm:pt-10">
            <p className="text-sm font-medium tracking-[0.24em] text-primary uppercase">
              Application workspace
            </p>
            <div className="grid gap-3">
              <h1 className="font-heading text-4xl font-semibold tracking-tight normal-case sm:text-5xl">
                Page unavailable.
              </h1>
              <CardDescription className="max-w-2xl text-sm leading-6 sm:text-base">
                The page you requested could not be found or is no longer available. Use the
                workspace links below to return to the correct area for your role.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="grid gap-6 px-6 pt-8 pb-10 sm:px-10 sm:pt-10 sm:pb-12">
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate("/login")}>
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                Go to sign in
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/applicant")}>
                <Home className="size-3.5" aria-hidden="true" />
                Applicant workspace
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/reviewer")}>
                <Search className="size-3.5" aria-hidden="true" />
                Reviewer workspace
              </Button>
            </div>

            <Separator />

            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              <strong className="font-semibold text-foreground">Tip:</strong> if you were
              expecting a specific application, go back to your list and reopen it from there.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
