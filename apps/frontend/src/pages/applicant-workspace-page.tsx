import { useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { apiQuery } from "@/lib/query"
import { formatDate, formatTimelineLabel, getStatusTone, humanizeStatus, type WorkflowTransition } from "@/lib/review-workflow"
import { cn } from "@/lib/utils"

type ApplicationRecord = {
  id: number
  title?: string | null
  organizationName?: string | null
  contactName?: string | null
  contactEmail?: string | null
  category?: string | null
  description?: string | null
  amount?: number | null
  status: string
  history?: WorkflowTransition[]
  createdAt?: string
  updatedAt?: string
}

type FormState = {
  organizationName: string
  contactName: string
  contactEmail: string
}

type ValidationError = {
  field?: string
  message: string
}

function parseErrorMessages(error: unknown) {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response &&
    "json" in error.response &&
    typeof error.response.json === "function"
  ) {
    return error.response.json() as Promise<{ errors?: ValidationError[] }>
  }

  return Promise.resolve({ errors: [] })
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function toFormState(application?: ApplicationRecord): FormState {
  return {
    organizationName: application?.organizationName ?? "",
    contactName: application?.contactName ?? "",
    contactEmail: application?.contactEmail ?? "",
  }
}

export function ApplicantWorkspacePage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery(apiQuery.applicant.applications.index.queryOptions())

  const createDraft = useMutation({
    ...apiQuery.applicant.applications.store.mutationOptions(),
    onSuccess: (response) => {
      navigate(`/applicant/applications/${response.data.id}/edit`)
    },
  })

  if (isLoading) {
    return <ApplicantShell>Loading your applications…</ApplicantShell>
  }

  if (error) {
    return <ApplicantShell>We couldn’t load your applications right now.</ApplicantShell>
  }

  return (
    <ApplicantShell>
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Applicant area
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                Your applications
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Start a draft, return to applications already in flight, and keep the workflow
                history visible without leaving the applicant surface.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {data.metadata.total} application{data.metadata.total === 1 ? "" : "s"} on this
                page
              </p>
              <Button
                size="sm"
                onClick={() => {
                  createDraft.mutate({ body: {} })
                }}
                disabled={createDraft.isPending}
              >
                {createDraft.isPending ? "Creating draft…" : "Start a new draft"}
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {data.data.map((application) => (
              <Link
                key={application.id}
                to={`/applicant/applications/${application.id}`}
                className="rounded-[1.75rem] border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      {application.title ?? application.organizationName ?? `Application #${application.id}`}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {application.contactName ?? "No contact name yet"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
                      getStatusTone(application.status),
                    )}
                  >
                    {humanizeStatus(application.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-border bg-[linear-gradient(180deg,_var(--card)_0%,_var(--muted)_100%)] p-8">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Workflow notes
            </p>
            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>Drafts stay editable until you submit the application.</p>
              <p>
                Requested changes open read-only first so the reviewer feedback is clear before you
                reopen the record for editing.
              </p>
              <p>
                Every transition is shown on the application detail page as an embedded timeline.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </ApplicantShell>
  )
}

export function ApplicantApplicationPage({ mode }: { mode: "view" | "edit" }) {
  const params = useParams()
  const applicationId = Number(params.id)
  const { data, isLoading, error } = useQuery(
    apiQuery.applicant.applications.show.queryOptions({
      params: { id: applicationId },
    }),
  )

  if (isLoading) {
    return <ApplicantShell>Loading the application…</ApplicantShell>
  }

  if (error || !data?.data) {
    return <ApplicantShell>We couldn’t load that application.</ApplicantShell>
  }

  return (
    <ApplicantShell>
      <ApplicantApplicationWorkspace
        key={`${data.data.id}:${data.data.updatedAt ?? ""}`}
        application={data.data as ApplicationRecord}
        applicationId={applicationId}
        mode={mode}
      />
    </ApplicantShell>
  )
}

function ApplicantApplicationWorkspace({
  application,
  applicationId,
  mode,
}: {
  application: ApplicationRecord
  applicationId: number
  mode: "view" | "edit"
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(() => toFormState(application))
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const updateDraft = useMutation({
    ...apiQuery.applicant.applications.update.mutationOptions(),
    onError: async (error) => {
      const response = await parseErrorMessages(error)
      const nextErrors = Object.fromEntries(
        (response.errors ?? [])
          .filter((entry) => Boolean(entry.field))
          .map((entry) => [entry.field as string, entry.message]),
      )
      setFieldErrors(nextErrors)
      setSuccessMessage(null)
    },
    onSuccess: (response) => {
      queryClient.setQueryData(
        apiQuery.applicant.applications.show.queryKey({ params: { id: applicationId } }),
        response,
      )
      queryClient.invalidateQueries(apiQuery.applicant.applications.pathFilter())
      setForm(toFormState(response.data as ApplicationRecord))
      setFieldErrors({})
      setSuccessMessage("Draft saved.")
    },
  })

  const submitApplication = useMutation({
    ...apiQuery.applicant.applications.submissions.store.mutationOptions(),
    onSuccess: (response) => {
      queryClient.setQueryData(
        apiQuery.applicant.applications.show.queryKey({ params: { id: applicationId } }),
        response,
      )
      queryClient.invalidateQueries(apiQuery.applicant.applications.pathFilter())
      setSuccessMessage("Application submitted.")
      navigate(`/applicant/applications/${applicationId}`, { replace: true })
    },
  })

  const reopenDraft = useMutation({
    ...apiQuery.applicant.application_draft_reopenings.store.mutationOptions(),
    onSuccess: (response) => {
      queryClient.setQueryData(
        apiQuery.applicant.applications.show.queryKey({ params: { id: applicationId } }),
        (current: { data?: ApplicationRecord } | undefined) => {
          if (!current?.data) {
            return current
          }

          return {
            ...current,
            data: {
              ...current.data,
              status: response.application.status,
              updatedAt: response.application.updatedAt,
            },
          }
        },
      )
      queryClient.invalidateQueries(apiQuery.applicant.applications.pathFilter())
      navigate(`/applicant/applications/${applicationId}/edit`, { replace: true })
    },
  })

  const isDraft = application.status === "draft"
  const isChangesRequested = application.status === "changes_requested"
  const canEdit = (mode === "edit" || location.pathname.endsWith("/edit")) && isDraft

  function handleSaveDraft() {
    if (form.contactEmail && !isValidEmail(form.contactEmail)) {
      setFieldErrors({
        contactEmail: "The contact email field must be a valid email address.",
      })
      setSuccessMessage(null)
      return
    }

    updateDraft.mutate({
      params: { id: application.id },
      body: {
        organizationName: form.organizationName || null,
        contactName: form.contactName || null,
        contactEmail: form.contactEmail || null,
      },
    })
  }

  function handleReopenDraft() {
    navigate(`/applicant/applications/${application.id}/edit`, { replace: true })
    reopenDraft.mutate({ params: { id: application.id } })
  }

  return (
    <>
      <div className="mb-6">
        <Link to="/applicant" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Back to applications
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-[2rem] border border-border bg-card p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Application detail
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                {canEdit
                  ? "Edit draft application"
                  : application.title ?? application.organizationName ?? `Application #${application.id}`}
              </h1>
              <p className="text-sm text-muted-foreground">
                Status: {humanizeStatus(application.status)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {isDraft && mode === "view" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/applicant/applications/${application.id}/edit`)}
                >
                  Edit draft
                </Button>
              ) : null}

              {isDraft ? (
                <Button
                  size="sm"
                  onClick={() => {
                    submitApplication.mutate({ params: { application_id: application.id } })
                  }}
                  disabled={submitApplication.isPending}
                >
                  {submitApplication.isPending ? "Submitting…" : "Submit application"}
                </Button>
              ) : null}

              {isChangesRequested ? (
                <Button size="sm" onClick={handleReopenDraft} disabled={reopenDraft.isPending}>
                  {reopenDraft.isPending ? "Reopening…" : "Reopen draft"}
                </Button>
              ) : null}
            </div>
          </div>

          {successMessage ? (
            <p className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-foreground">
              {successMessage}
            </p>
          ) : null}

          {canEdit ? (
            <form
              className="grid gap-5"
              onSubmit={(event) => {
                event.preventDefault()
                handleSaveDraft()
              }}
            >
              <Field
                label="Organization name"
                value={form.organizationName}
                error={fieldErrors.organizationName}
                onChange={(value) => {
                  setForm((current) => ({ ...current, organizationName: value }))
                }}
              />
              <Field
                label="Contact name"
                value={form.contactName}
                error={fieldErrors.contactName}
                onChange={(value) => {
                  setForm((current) => ({ ...current, contactName: value }))
                }}
              />
              <Field
                label="Contact email"
                type="email"
                value={form.contactEmail}
                error={fieldErrors.contactEmail}
                onChange={(value) => {
                  setForm((current) => ({ ...current, contactEmail: value }))
                }}
              />

              <div className="flex flex-wrap gap-3">
                <Button type="button" disabled={updateDraft.isPending} onClick={handleSaveDraft}>
                  {updateDraft.isPending ? "Saving…" : "Save draft"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/applicant/applications/${application.id}`)}
                >
                  View detail
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4 rounded-[1.75rem] border border-border bg-muted/40 p-6">
              <ReadOnlyRow label="Organization name" value={application.organizationName} />
              <ReadOnlyRow label="Contact name" value={application.contactName} />
              <ReadOnlyRow label="Contact email" value={application.contactEmail} />
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Embedded audit
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Application timeline
              </h2>
            </div>

            <div className="space-y-4">
              {(application.history ?? []).length > 0 ? (
                application.history?.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-[1.5rem] border border-border bg-muted/35 p-5"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {formatTimelineLabel(entry)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDate(entry.createdAt)}</p>
                    {entry.comment ? (
                      <p className="mt-3 text-sm leading-6 text-foreground">{entry.comment}</p>
                    ) : null}
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No workflow transitions yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

function ApplicantShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-svh bg-[linear-gradient(180deg,_var(--background)_0%,_color-mix(in_oklch,var(--background),white_24%)_100%)] px-6 py-8 text-foreground sm:px-10 lg:px-12">
      <div className="mx-auto max-w-7xl">{children}</div>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: string
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function ReadOnlyRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm text-foreground">{value || "Not provided yet"}</p>
    </div>
  )
}
