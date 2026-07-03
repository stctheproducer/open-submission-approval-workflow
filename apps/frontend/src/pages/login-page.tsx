import { useId, useMemo, useState, type FormEvent } from "react"
import { Navigate, useNavigate } from "react-router"
import { ArrowRight, LoaderCircle } from "lucide-react"
import { useMutation } from "@tanstack/react-query"

import loginIllustration from "@/assets/login-illustration.svg"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { apiQuery } from "@/lib/query"
import type { Role } from "@/routing/access-policy"

type FormState = {
  email: string
  password: string
}

type ProblemDetails = {
  detail?: string
  errors?: Array<{
    field?: string
    message: string
  }>
}

type LoginPageProps = {
  currentRole?: Role
  onSignedIn?: (role: Exclude<Role, null>) => void
}

const INITIAL_FORM_STATE: FormState = {
  email: "",
  password: "",
}

const WORKSPACE_PATH_BY_ROLE: Record<Exclude<Role, null>, string> = {
  applicant: "/applicant",
  reviewer: "/reviewer",
}

function parseProblemDetails(error: unknown) {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response &&
    "json" in error.response &&
    typeof error.response.json === "function"
  ) {
    return error.response.json() as Promise<ProblemDetails>
  }

  return Promise.resolve({ detail: undefined, errors: [] })
}

function roleToWorkspace(role: Exclude<Role, null>) {
  return WORKSPACE_PATH_BY_ROLE[role]
}

export function LoginPage({ currentRole, onSignedIn }: LoginPageProps) {
  const navigate = useNavigate()
  const emailId = useId()
  const passwordId = useId()

  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const loginMutation = useMutation({
    ...apiQuery.auth.sessions.store.mutationOptions(),
    onError: async (error) => {
      const details = await parseProblemDetails(error)
      const nextFieldErrors = Object.fromEntries(
        (details.errors ?? [])
          .filter((entry) => Boolean(entry.field))
          .map((entry) => [entry.field as keyof FormState, entry.message])
      ) as Partial<Record<keyof FormState, string>>

      setFieldErrors(nextFieldErrors)
      setFormError(
        nextFieldErrors.email || nextFieldErrors.password
          ? null
          : details.detail ?? "We couldn’t sign you in right now."
      )
    },
    onSuccess: (response) => {
      const role = response.user.role
      if (role !== "applicant" && role !== "reviewer") {
        setFormError("Signed in, but we could not determine where to send you.")
        return
      }

      onSignedIn?.(role)
      navigate(roleToWorkspace(role), { replace: true })
    },
  })

  const emailError = useMemo(() => {
    if (fieldErrors.email) {
      return fieldErrors.email
    }

    if (attemptedSubmit && form.email.trim().length === 0) {
      return "Enter the work email attached to your account."
    }

    return undefined
  }, [attemptedSubmit, fieldErrors.email, form.email])

  const passwordError = useMemo(() => {
    if (fieldErrors.password) {
      return fieldErrors.password
    }

    if (attemptedSubmit && form.password.trim().length === 0) {
      return "Enter your password to continue."
    }

    return undefined
  }, [attemptedSubmit, fieldErrors.password, form.password])

  if (currentRole) {
    return <Navigate to={roleToWorkspace(currentRole)} replace />
  }

  const emailErrorId = emailError ? `${emailId}-error` : undefined
  const passwordErrorId = passwordError ? `${passwordId}-error` : undefined

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setAttemptedSubmit(true)
    setFormError(null)
    setFieldErrors({})

    const nextFieldErrors: Partial<Record<keyof FormState, string>> = {}
    if (form.email.trim().length === 0) {
      nextFieldErrors.email = "Enter the work email attached to your account."
    }

    if (form.password.trim().length === 0) {
      nextFieldErrors.password = "Enter your password to continue."
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setFormError("Enter your email and password to continue.")
      return
    }

    loginMutation.mutate({
      body: {
        email: form.email,
        password: form.password,
      },
    })
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="grid min-h-svh lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative isolate overflow-hidden border-b border-border bg-[linear-gradient(180deg,_var(--card)_0%,_var(--background)_100%)] lg:border-b-0 lg:border-r lg:border-border">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,_rgba(95,161,125,0.16),_transparent_30%),radial-gradient(circle_at_82%_82%,_rgba(124,139,168,0.12),_transparent_34%)]" />
          <div className="relative flex h-full min-h-[32rem] flex-col gap-8 p-6 sm:p-10 lg:p-12">
            <div className="flex justify-end">
              <ThemeToggle />
            </div>

            <div className="flex flex-1 flex-col justify-between gap-8">
              <div className="max-w-xl flex flex-col gap-4 pt-8 lg:pt-0">
                <p className="text-sm font-medium tracking-[0.24em] text-primary uppercase">
                  Application workspace
                </p>
                <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  Sign in to continue.
                </h1>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Use your work email to sign in to your account.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="rounded-[1.5rem] border border-border bg-card shadow-sm">
                  <CardHeader className="gap-2">
                    <CardTitle className="text-sm font-semibold tracking-[0.24em] uppercase">
                      Applicants
                    </CardTitle>
                    <CardDescription className="text-sm leading-6">
                      Draft, submit, reopen, and return to applications without losing the workflow
                      thread.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="rounded-[1.5rem] border border-border bg-card shadow-sm">
                  <CardHeader className="gap-2">
                    <CardTitle className="text-sm font-semibold tracking-[0.24em] uppercase">
                      Reviewers
                    </CardTitle>
                    <CardDescription className="text-sm leading-6">
                      Pick up the queue, move applications forward, and keep decisions atomic.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm">
                <img
                  src={loginIllustration}
                  alt="A preview of the application workspace"
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <Card className="w-full max-w-lg rounded-[2rem] border border-border">
            <CardHeader className="gap-4">
              <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
                Secure sign-in
              </p>
              <div className="flex flex-col gap-3">
                <CardTitle className="text-3xl font-semibold tracking-tight normal-case">
                  Welcome back
                </CardTitle>
                <CardDescription className="max-w-md text-sm leading-6">
                  Sign in with the email tied to your account. 
                </CardDescription>
              </div>
            </CardHeader>

            <form aria-label="Sign in form" onSubmit={handleSubmit}>
              <CardContent className="flex flex-col gap-6">
                {formError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Sign in failed</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                ) : null}

                <FieldGroup className="gap-5">
                  <Field data-invalid={Boolean(emailError) || undefined}>
                    <FieldLabel htmlFor={emailId}>Work email</FieldLabel>
                    <FieldContent>
                      <Input
                        id={emailId}
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={form.email}
                        aria-invalid={Boolean(emailError)}
                        aria-describedby={emailErrorId}
                        onChange={(event) => {
                          const nextEmail = event.target.value
                          setForm((current) => ({ ...current, email: nextEmail }))
                          setFieldErrors((current) => ({ ...current, email: undefined }))
                        }}
                      />
                      <FieldDescription>
                        Use the email address tied to your applicant or reviewer account.
                      </FieldDescription>
                      <FieldError id={emailErrorId}>{emailError}</FieldError>
                    </FieldContent>
                  </Field>

                  <Field data-invalid={Boolean(passwordError) || undefined}>
                    <FieldLabel htmlFor={passwordId}>Password</FieldLabel>
                    <FieldContent>
                      <Input
                        id={passwordId}
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={form.password}
                        aria-invalid={Boolean(passwordError)}
                        aria-describedby={passwordErrorId}
                        onChange={(event) => {
                          const nextPassword = event.target.value
                          setForm((current) => ({ ...current, password: nextPassword }))
                          setFieldErrors((current) => ({ ...current, password: undefined }))
                        }}
                      />
                      <FieldError id={passwordErrorId}>{passwordError}</FieldError>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </CardContent>

              <Separator className="my-4" />

              <CardFooter className="flex flex-col items-stretch gap-3 mt-4">
                <Button type="submit" size="lg" className="w-full" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? (
                    <>
                      <LoaderCircle data-icon="inline-start" className="animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      <ArrowRight data-icon="inline-start" />
                      Continue
                    </>
                  )}
                </Button>
                <p className="text-sm leading-6 text-muted-foreground">
                  Need help? Contact support if your seeded login details do not work.
                </p>
              </CardFooter>
            </form>
          </Card>
        </section>
      </div>
    </main>
  )
}
