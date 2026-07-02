import { useId, useState, type FormEvent } from "react"

import loginIllustration from "@/assets/login-illustration.svg"
import { ThemeToggle } from "@/components/theme-toggle"

type FormState = {
  email: string
  password: string
  remember: boolean
}

const INITIAL_FORM_STATE: FormState = {
  email: "",
  password: "",
  remember: true,
}

export function LoginPage() {
  const emailId = useId()
  const passwordId = useId()
  const rememberId = useId()

  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emailMissing = attemptedSubmit && form.email.trim().length === 0
  const passwordMissing = attemptedSubmit && form.password.trim().length === 0
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setAttemptedSubmit(true)

    if (form.email.trim().length === 0 || form.password.trim().length === 0) {
      setFormError("Enter your email and password to continue.")
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    window.setTimeout(() => {
      setIsSubmitting(false)
    }, 900)
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="grid min-h-svh lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative isolate overflow-hidden border-b border-border bg-[linear-gradient(180deg,_var(--card)_0%,_var(--background)_100%)] lg:border-b-0 lg:border-r lg:border-border">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,_rgba(95,161,125,0.16),_transparent_30%),radial-gradient(circle_at_82%_82%,_rgba(124,139,168,0.12),_transparent_34%)]" />
          <div className="relative flex h-full min-h-[32rem] flex-col justify-between gap-8 p-6 sm:p-10 lg:p-12">
            <ThemeToggle />

            <div className="max-w-xl space-y-4 pt-8 lg:pt-0">
              <p className="text-sm font-medium text-primary">Application workspace</p>
              <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Sign in to continue.
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Use your work email to resume an application or continue a review. Sessions stay
                in this browser so you can move quickly between tasks.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/85">
                  Applicants
                </p>
                <p className="mt-2 text-sm text-muted-foreground">Draft, submit, and return to work.</p>
              </div>
              <div className="rounded-2xl border border-border bg-card px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/85">
                  Reviewers
                </p>
                <p className="mt-2 text-sm text-muted-foreground">Pick up queues and make decisions.</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <img
                src={loginIllustration}
                alt="A preview of the application workspace"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-lg">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Welcome back
                </h2>
                <p className="max-w-md text-sm leading-6 text-muted-foreground">
                  Sign in with the email tied to your account. You’ll use the same session whether
                  you’re drafting or reviewing.
                </p>
              </div>

              <form className="mt-8 space-y-4" aria-label="Sign in form" onSubmit={handleSubmit}>
                {formError ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  >
                    {formError}
                  </p>
                ) : null}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor={emailId}>
                    Work email
                  </label>
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={form.email}
                    aria-invalid={emailMissing}
                    aria-describedby={emailMissing ? `${emailId}-error` : undefined}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, email: event.target.value }))
                    }}
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {emailMissing ? (
                    <p id={`${emailId}-error`} className="text-sm text-destructive">
                      Enter the work email attached to your account.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor={passwordId}>
                    Password
                  </label>
                  <input
                    id={passwordId}
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    aria-invalid={passwordMissing}
                    aria-describedby={passwordMissing ? `${passwordId}-error` : undefined}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, password: event.target.value }))
                    }}
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {passwordMissing ? (
                    <p id={`${passwordId}-error`} className="text-sm text-destructive">
                      Enter your password to continue.
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                  <label
                    htmlFor={rememberId}
                    className="inline-flex items-center gap-3 text-muted-foreground"
                  >
                    <input
                      id={rememberId}
                      type="checkbox"
                      name="remember"
                      checked={form.remember}
                      onChange={(event) => {
                        setForm((current) => ({ ...current, remember: event.target.checked }))
                      }}
                      className="size-4 rounded border-border bg-transparent text-primary focus:ring-primary/20"
                    />
                    Keep me signed in
                  </label>

                  <p className="text-muted-foreground">Need help? Contact support.</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-progress disabled:opacity-70"
                >
                  {isSubmitting ? "Signing in…" : "Continue"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
