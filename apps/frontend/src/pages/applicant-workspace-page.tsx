import { useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { ApplicationStatusBadge } from "@/components/workflow-badge"
import { WorkflowTimeline } from "@/components/workflow-timeline"
import { SuccessAlert } from "@/components/workspace-alert"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { apiQuery } from "@/lib/query"
import { humanizeStatus, type WorkflowTransition } from "@/lib/review-workflow"

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
  const { data, isLoading, error } = useQuery(
    apiQuery.applicant.applications.index.queryOptions()
  )
  const applications = data?.data ?? []
  const totalApplications = Number(data?.metadata.total ?? 0)

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
    return (
      <ApplicantShell>
        We couldn’t load your applications right now.
      </ApplicantShell>
    )
  }

  return (
    <ApplicantShell>
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-5">
          <Card className="rounded-[2rem] border border-border shadow-sm">
            <CardHeader className="gap-4">
              <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
                Applicant area
              </p>
              <div className="flex flex-col gap-3">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                  Your applications
                </h1>
                <CardDescription className="max-w-2xl text-sm leading-6">
                  Start a draft, return to applications already in flight, and
                  keep the workflow history visible without leaving the
                  applicant surface.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {totalApplications} application
                {totalApplications === 1 ? "" : "s"} on this page
              </p>
              <Button
                size="sm"
                onClick={() => {
                  createDraft.mutate({ body: {} })
                }}
                disabled={createDraft.isPending}
              >
                {createDraft.isPending
                  ? "Creating draft…"
                  : "Start a new draft"}
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {applications.map((application) => (
              <Card
                key={application.id}
                className="rounded-[1.75rem] border border-border py-6 transition hover:border-primary/40 hover:shadow-sm"
              >
                <CardContent>
                  <Link
                    to={`/applicant/applications/${application.id}`}
                    className="flex flex-wrap items-start justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        {application.title ??
                          application.organizationName ??
                          `Application #${application.id}`}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {application.contactName ?? "No contact name yet"}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={application.status} />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <aside>
          <Card className="rounded-[2rem] border border-border bg-[linear-gradient(180deg,_var(--card)_0%,_var(--muted)_100%)]">
            <CardHeader>
              <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
                Workflow notes
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
              <p>Drafts stay editable until you submit the application.</p>
              <p>
                Requested changes open read-only first so the reviewer feedback
                is clear before you reopen the record for editing.
              </p>
              <p>
                Every transition is shown on the application detail page as an
                embedded timeline.
              </p>
            </CardContent>
          </Card>
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
    })
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
          .map((entry) => [entry.field as string, entry.message])
      )
      setFieldErrors(nextErrors)
      setSuccessMessage(null)
    },
    onSuccess: (response) => {
      queryClient.setQueryData(
        apiQuery.applicant.applications.show.queryKey({
          params: { id: applicationId },
        }),
        response
      )
      queryClient.invalidateQueries(
        apiQuery.applicant.applications.pathFilter()
      )
      setForm(toFormState(response.data as ApplicationRecord))
      setFieldErrors({})
      setSuccessMessage("Draft saved.")
    },
  })

  const submitApplication = useMutation({
    ...apiQuery.applicant.applications.submissions.store.mutationOptions(),
    onSuccess: (response) => {
      queryClient.setQueryData(
        apiQuery.applicant.applications.show.queryKey({
          params: { id: applicationId },
        }),
        response
      )
      queryClient.invalidateQueries(
        apiQuery.applicant.applications.pathFilter()
      )
      setSuccessMessage("Application submitted.")
      navigate(`/applicant/applications/${applicationId}`, { replace: true })
    },
  })

  const reopenDraft = useMutation({
    ...apiQuery.applicant.applicationDraftReopenings.store.mutationOptions(),
    onSuccess: (response) => {
      queryClient.setQueryData<{ data?: ApplicationRecord }>(
        apiQuery.applicant.applications.show.queryKey({
          params: { id: applicationId },
        }),
        (current) => {
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
        }
      )
      queryClient.invalidateQueries(
        apiQuery.applicant.applications.pathFilter()
      )
      navigate(`/applicant/applications/${applicationId}/edit`, {
        replace: true,
      })
    },
  })

  const isDraft = application.status === "draft"
  const isChangesRequested = application.status === "changes_requested"
  const canEdit =
    (mode === "edit" || location.pathname.endsWith("/edit")) && isDraft

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
    navigate(`/applicant/applications/${application.id}/edit`, {
      replace: true,
    })
    reopenDraft.mutate({ params: { id: application.id } })
  }

  return (
    <>
      <div className="mb-6">
        <Link
          to="/applicant"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to applications
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[2rem] border border-border">
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
                  Application detail
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                  {canEdit
                    ? "Edit draft application"
                    : (application.title ??
                      application.organizationName ??
                      `Application #${application.id}`)}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Status: {humanizeStatus(application.status)}
                  </p>
                  <ApplicationStatusBadge status={application.status} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {isDraft && mode === "view" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/applicant/applications/${application.id}/edit`)
                    }
                  >
                    Edit draft
                  </Button>
                ) : null}

                {isDraft ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      submitApplication.mutate({
                        params: { application_id: application.id },
                      })
                    }}
                    disabled={submitApplication.isPending}
                  >
                    {submitApplication.isPending
                      ? "Submitting…"
                      : "Submit application"}
                  </Button>
                ) : null}

                {isChangesRequested ? (
                  <Button
                    size="sm"
                    onClick={handleReopenDraft}
                    disabled={reopenDraft.isPending}
                  >
                    {reopenDraft.isPending ? "Reopening…" : "Reopen draft"}
                  </Button>
                ) : null}
              </div>
            </div>

            <Separator className="bg-border/70" />

            {successMessage ? (
              <SuccessAlert>{successMessage}</SuccessAlert>
            ) : null}

            {canEdit ? (
              <form
                className="flex flex-col gap-5"
                onSubmit={(event) => {
                  event.preventDefault()
                  handleSaveDraft()
                }}
              >
                <FieldGroup className="gap-5">
                  <Field
                    data-invalid={
                      Boolean(fieldErrors.organizationName) || undefined
                    }
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="organization-name">
                        Organization name
                      </FieldLabel>
                      <FieldDescription id="organization-name-description">
                        The legal or trading name shown to reviewers.
                      </FieldDescription>
                      <Input
                        id="organization-name"
                        value={form.organizationName}
                        onChange={(event) => {
                          setForm((current) => ({
                            ...current,
                            organizationName: event.target.value,
                          }))
                        }}
                        aria-invalid={Boolean(fieldErrors.organizationName)}
                        aria-describedby={
                          fieldErrors.organizationName
                            ? "organization-name-description organization-name-error"
                            : "organization-name-description"
                        }
                      />
                      <FieldError id="organization-name-error">
                        {fieldErrors.organizationName}
                      </FieldError>
                    </FieldContent>
                  </Field>

                  <Field
                    data-invalid={Boolean(fieldErrors.contactName) || undefined}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="contact-name">
                        Contact name
                      </FieldLabel>
                      <FieldDescription id="contact-name-description">
                        The person reviewers should address in the workflow.
                      </FieldDescription>
                      <Input
                        id="contact-name"
                        value={form.contactName}
                        onChange={(event) => {
                          setForm((current) => ({
                            ...current,
                            contactName: event.target.value,
                          }))
                        }}
                        aria-invalid={Boolean(fieldErrors.contactName)}
                        aria-describedby={
                          fieldErrors.contactName
                            ? "contact-name-description contact-name-error"
                            : "contact-name-description"
                        }
                      />
                      <FieldError id="contact-name-error">
                        {fieldErrors.contactName}
                      </FieldError>
                    </FieldContent>
                  </Field>

                  <Field
                    data-invalid={
                      Boolean(fieldErrors.contactEmail) || undefined
                    }
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="contact-email">
                        Contact email
                      </FieldLabel>
                      <FieldDescription id="contact-email-description">
                        Used for submission follow-up and reviewer
                        communication.
                      </FieldDescription>
                      <Input
                        id="contact-email"
                        type="email"
                        value={form.contactEmail}
                        onChange={(event) => {
                          setForm((current) => ({
                            ...current,
                            contactEmail: event.target.value,
                          }))
                        }}
                        aria-invalid={Boolean(fieldErrors.contactEmail)}
                        aria-describedby={
                          fieldErrors.contactEmail
                            ? "contact-email-description contact-email-error"
                            : "contact-email-description"
                        }
                      />
                      <FieldError id="contact-email-error">
                        {fieldErrors.contactEmail}
                      </FieldError>
                    </FieldContent>
                  </Field>
                </FieldGroup>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    disabled={updateDraft.isPending}
                    onClick={handleSaveDraft}
                  >
                    {updateDraft.isPending ? "Saving…" : "Save draft"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      navigate(`/applicant/applications/${application.id}`)
                    }
                  >
                    View detail
                  </Button>
                </div>
              </form>
            ) : (
              <Card className="rounded-[1.75rem] border border-border bg-muted/40 py-6 shadow-none">
                <CardContent className="grid gap-4">
                  <ReadOnlyRow
                    label="Organization name"
                    value={application.organizationName}
                  />
                  <ReadOnlyRow
                    label="Contact name"
                    value={application.contactName}
                  />
                  <ReadOnlyRow
                    label="Contact email"
                    value={application.contactEmail}
                  />
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <WorkflowTimeline
          eyebrow="Embedded audit"
          title="Application timeline"
          emptyMessage="No workflow transitions yet."
          history={application.history}
        />
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

function ReadOnlyRow({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm text-foreground">
        {value || "Not provided yet"}
      </p>
    </div>
  )
}
