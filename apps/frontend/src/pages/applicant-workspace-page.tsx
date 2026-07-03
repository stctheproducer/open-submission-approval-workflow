import { type ReactNode, useState } from "react"
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ChevronLeft, Inbox } from "lucide-react"

import { ApplicationStatusBadge } from "@/components/workflow-badge"
import { CardTotalBadge } from "@/components/card-total-badge"
import { QueuePaginationControls } from "@/components/queue-pagination"
import { WorkflowTimeline } from "@/components/workflow-timeline"
import { SuccessAlert } from "@/components/workspace-alert"
import { Badge } from "@/components/ui/badge"
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
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { AuthenticatedShell } from "@/components/authenticated-shell"
import { apiQuery } from "@/lib/query"
import {
  formatAmount,
  type WorkflowApplication,
} from "@/lib/review-workflow"
import { useApplicationPageMeta } from "@/routing/page-meta"

const APPLICATION_CATEGORY_OPTIONS = [
  "Operations",
  "Finance",
  "Technology",
  "Sales",
  "People",
] as const

const APPLICATION_PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const

type FormState = {
  title: string
  category: string
  description: string
  amount: string
}

type ValidationError = {
  field?: string
  message: string
}

type ProblemDetails = {
  detail?: string
  errors?: ValidationError[]
}

function errorMessagesFromDetails(details: ProblemDetails) {
  const messages = (details.errors ?? [])
    .map((entry) => entry.message.trim())
    .filter((message) => message.length > 0)

  if (messages.length > 0) {
    return messages
  }

  return details.detail ? [details.detail] : []
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

function fieldErrorsFromDetails(details: ProblemDetails) {
  return Object.fromEntries(
    (details.errors ?? [])
      .filter((entry) => Boolean(entry.field))
      .map((entry) => [entry.field as string, entry.message])
  )
}

function toFormState(application?: WorkflowApplication): FormState {
  return {
    title: application?.title ?? "",
    category: application?.category ?? "",
    description: application?.description ?? "",
    amount:
      application?.amount === null || application?.amount === undefined
        ? ""
        : String(application.amount),
  }
}

function ApplicantEmptyState() {
  return (
    <div className="flex flex-col gap-6 px-1 py-2 sm:px-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
            No applications yet
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Start your first draft.
          </h2>
        </div>
      </div>

      <div className="grid gap-4 rounded-[1.75rem] border border-border/70 bg-background/60 p-6 shadow-none sm:grid-cols-[auto,1fr] sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Inbox className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
            Drafts live here
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Create a draft to begin an application. Once it is in flight, you
            can reopen it from this list and continue the workflow without
            leaving the applicant area.
          </p>
        </div>
      </div>
    </div>
  )
}

function ApplicantNewApplicationPage({
  onSignedOut,
}: {
  onSignedOut?: () => void
}) {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>({
    title: "",
    category: "",
    description: "",
    amount: "",
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const createDraft = useMutation({
    ...apiQuery.applicant.applications.store.mutationOptions(),
    onError: async (error) => {
      const details = await parseProblemDetails(error)
      const nextErrors = fieldErrorsFromDetails(details)
      setFieldErrors(nextErrors)

      const messages = errorMessagesFromDetails(details)
      if (messages.length > 0) {
        messages.forEach((message) => {
          toast.error(message)
        })
      } else {
        toast.error("We couldn’t create the draft right now.")
      }
    },
    onSuccess: (response) => {
      toast.success("Draft created.")
      navigate(`/applicant/applications/${response.data.id}/edit`, {
        replace: true,
      })
    },
  })

  function handleCreateDraft() {
    const numericAmount = Number(form.amount)
    const nextFieldErrors: Record<string, string> = {}

    if (!form.title.trim()) {
      nextFieldErrors.title = "Title is required."
    }

    if (!form.category.trim()) {
      nextFieldErrors.category = "Choose a category."
    }

    if (!form.description.trim()) {
      nextFieldErrors.description = "Description is required."
    }

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      nextFieldErrors.amount = "Enter a valid positive amount."
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      return
    }

    createDraft.mutate({
      body: {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        amount: numericAmount,
      },
    })
  }

  return (
    <ApplicantShell onSignedOut={onSignedOut}>
      <div className="mb-6">
        <Link
          to="/applicant"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to applications
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[2rem] border border-border">
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
                  New application
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                  Start a draft with the details already filled in.
                </h1>
                <CardDescription className="max-w-2xl text-sm leading-6">
                  Create the draft once, then continue editing it from the
                  application page if you need to refine the details or add an
                  attachment.
                </CardDescription>
              </div>
            </div>

            <Separator className="bg-border/70" />

            <FieldGroup className="gap-5">
              <Field data-invalid={Boolean(fieldErrors.title) || undefined}>
                <FieldContent>
                  <FieldLabel htmlFor="new-application-title">Title</FieldLabel>
                  <FieldDescription id="new-application-title-description">
                    Give the application a clear working title.
                  </FieldDescription>
                  <Input
                    id="new-application-title"
                    value={form.title}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                      if (fieldErrors.title) {
                        setFieldErrors((current) => {
                          const { title: _title, ...rest } = current
                          return rest
                        })
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.title)}
                    aria-describedby={
                      fieldErrors.title
                        ? "new-application-title-description new-application-title-error"
                        : "new-application-title-description"
                    }
                  />
                  <FieldError id="new-application-title-error">
                    {fieldErrors.title}
                  </FieldError>
                </FieldContent>
              </Field>

              <Field data-invalid={Boolean(fieldErrors.category) || undefined}>
                <FieldContent>
                  <FieldLabel htmlFor="new-application-category">
                    Category
                  </FieldLabel>
                  <FieldDescription id="new-application-category-description">
                    Pick the one category that best fits the application.
                  </FieldDescription>
                  <RadioGroup
                    aria-label="Application category"
                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                    value={form.category}
                    onValueChange={(nextValue) => {
                      const nextCategory = nextValue ?? ""
                      setForm((current) => ({
                        ...current,
                        category: nextCategory,
                      }))
                      if (fieldErrors.category) {
                        setFieldErrors((current) => {
                          const { category: _category, ...rest } = current
                          return rest
                        })
                      }
                    }}
                  >
                    {APPLICATION_CATEGORY_OPTIONS.map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-muted/40 has-data-[state=checked]:border-primary/40 has-data-[state=checked]:bg-primary/6"
                      >
                        <RadioGroupItem value={option} aria-label={option} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  <FieldError id="new-application-category-error">
                    {fieldErrors.category}
                  </FieldError>
                </FieldContent>
              </Field>

              <Field
                data-invalid={Boolean(fieldErrors.description) || undefined}
              >
                <FieldContent>
                  <FieldLabel htmlFor="new-application-description">
                    Description
                  </FieldLabel>
                  <FieldDescription id="new-application-description-description">
                    Describe what the reviewer needs to understand.
                  </FieldDescription>
                  <Textarea
                    id="new-application-description"
                    value={form.description}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                      if (fieldErrors.description) {
                        setFieldErrors((current) => {
                          const { description: _description, ...rest } = current
                          return rest
                        })
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.description)}
                    aria-describedby={
                      fieldErrors.description
                        ? "new-application-description-description new-application-description-error"
                        : "new-application-description-description"
                    }
                  />
                  <FieldError id="new-application-description-error">
                    {fieldErrors.description}
                  </FieldError>
                </FieldContent>
              </Field>

              <Field data-invalid={Boolean(fieldErrors.amount) || undefined}>
                <FieldContent>
                  <FieldLabel htmlFor="new-application-amount">
                    Amount
                  </FieldLabel>
                  <FieldDescription id="new-application-amount-description">
                    Enter the requested amount as a positive number.
                  </FieldDescription>
                  <Input
                    id="new-application-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.amount}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                      if (fieldErrors.amount) {
                        setFieldErrors((current) => {
                          const { amount: _amount, ...rest } = current
                          return rest
                        })
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.amount)}
                    aria-describedby={
                      fieldErrors.amount
                        ? "new-application-amount-description new-application-amount-error"
                        : "new-application-amount-description"
                    }
                  />
                  <FieldError id="new-application-amount-error">
                    {fieldErrors.amount}
                  </FieldError>
                </FieldContent>
              </Field>
            </FieldGroup>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={createDraft.isPending}
                onClick={handleCreateDraft}
              >
                {createDraft.isPending ? "Creating…" : "Create draft"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/applicant")}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <aside className="order-first lg:order-none">
          <Card className="rounded-[2rem] border border-border bg-[linear-gradient(180deg,_var(--card)_0%,_var(--muted)_100%)]">
            <CardHeader>
              <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
                Draft preview
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
              <p>
                These details appear in the applicant list, the draft detail
                page, and the reviewer queue once the application is submitted.
              </p>
              <p>
                Attach files later if needed. The draft stays editable until
                submission.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </ApplicantShell>
  )
}

export function ApplicantWorkspacePage({
  onSignedOut,
}: {
  onSignedOut?: () => void
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Number(searchParams.get("page") ?? "1")
  const activePage =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1
  const perPageParam = Number(searchParams.get("perPage") ?? "20")
  const activePerPage = APPLICATION_PAGE_SIZE_OPTIONS.includes(
    Number.isFinite(perPageParam) && perPageParam > 0
      ? (Math.floor(
          perPageParam
        ) as (typeof APPLICATION_PAGE_SIZE_OPTIONS)[number])
      : 20
  )
    ? Number.isFinite(perPageParam) && perPageParam > 0
      ? Math.floor(perPageParam)
      : 20
    : 20
  const { data, isLoading, error } = useQuery(
    apiQuery.applicant.applications.index.queryOptions({
      query: { page: activePage, perPage: activePerPage },
    })
  )
  const applications = data?.data ?? []
  const totalApplications = Number(data?.metadata.total ?? 0)
  const currentPage = Number(data?.metadata.currentPage ?? 1)
  const lastPage = Number(data?.metadata.lastPage ?? 1)

  function setApplicationsPage(nextPage: number) {
    const nextParams = new URLSearchParams(searchParams)
    if (nextPage <= 1) {
      nextParams.delete("page")
    } else {
      nextParams.set("page", String(nextPage))
    }

    setSearchParams(nextParams, { replace: true, preventScrollReset: true })
  }

  function setApplicationsPerPage(nextPerPage: number) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("perPage", String(nextPerPage))
    nextParams.delete("page")
    setSearchParams(nextParams, { replace: true, preventScrollReset: true })
  }

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
    <ApplicantShell onSignedOut={onSignedOut}>
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-5">
          <Card className="relative rounded-[2rem] border border-border shadow-sm">
            <CardTotalBadge
              total={totalApplications}
              label={`${totalApplications} application${totalApplications === 1 ? "" : "s"}`}
            />
            <CardContent className="flex flex-wrap items-start justify-between gap-6 pr-16">
              <div className="flex max-w-2xl flex-col gap-3">
                <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
                  Applicant area
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                  Your applications
                </h1>
                <CardDescription className="max-w-2xl text-sm leading-6">
                  Start a draft, return to applications already in flight, and
                  keep the workflow history visible without leaving the
                  applicant surface.
                </CardDescription>
              </div>
              <Link
                to="/applicant/applications/new"
                className="inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-primary px-4 py-2 text-xs font-semibold tracking-widest whitespace-nowrap text-primary-foreground uppercase transition-all hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                Start a new draft
              </Link>
            </CardContent>
          </Card>

          <QueuePaginationControls
            currentPage={currentPage}
            lastPage={lastPage}
            perPage={activePerPage}
            onPageChange={setApplicationsPage}
            onPerPageChange={setApplicationsPerPage}
          />

          <div className="grid gap-4">
            {applications.length > 0 ? (
              applications.map((application) => (
                <Card
                  key={application.id}
                  className="rounded-[1.75rem] border border-border py-6 transition hover:border-primary/40 hover:shadow-sm"
                >
                  <CardContent>
                    <Link
                      to={`/applicant/applications/${application.id}`}
                      className="flex flex-wrap items-start justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">
                            {application.category ?? "Uncategorized"}
                          </Badge>
                          <Badge variant="outline">
                            {formatAmount(application.amount)}
                          </Badge>
                          {application.attachmentUrl ? (
                            <Badge variant="outline">Attachment</Badge>
                          ) : null}
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                            {application.title ??
                              `Application #${application.id}`}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {application.description ?? "No description yet"}
                          </p>
                        </div>
                      </div>
                      <ApplicationStatusBadge status={application.status} />
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <ApplicantEmptyState />
            )}
          </div>
        </div>

        <aside className="order-first lg:order-none">
          <Card className="rounded-[2rem] border border-border bg-[linear-gradient(180deg,_var(--card)_0%,_var(--muted)_100%)]">
            <CardHeader>
              <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
                Workflow notes
              </p>
              <CardTitle className="text-2xl tracking-tight normal-case">
                What stays with the application
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6">
                The reviewer sees the title, category, description, amount, and
                any attachment.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
              <p>Drafts stay editable until you submit them.</p>
              <p>If changes are requested, you reopen the same record.</p>
              <p>Every status change appears on the application timeline.</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </ApplicantShell>
  )
}

export function ApplicantApplicationPage({
  mode,
  onSignedOut,
}: {
  mode: "view" | "edit"
  onSignedOut?: () => void
}) {
  const params = useParams()
  const applicationId = Number(params.id)
  const applicationQuery = useQuery(
    apiQuery.applicant.applications.show.queryOptions({
      params: { id: applicationId },
    })
  )
  const { data } = applicationQuery

  if (applicationQuery.isLoading) {
    return (
      <ApplicantDetailShell
        onSignedOut={onSignedOut}
        eyebrow="Applicant area"
        title="Loading application detail."
        description="Pulling the current application and its workflow history into the applicant workspace."
      >
        <ApplicantLoadingPanel body="Loading application detail…" />
      </ApplicantDetailShell>
    )
  }

  if (applicationQuery.error || !data?.data) {
    return (
      <ApplicantDetailShell
        onSignedOut={onSignedOut}
        eyebrow="Applicant area"
        title="Application detail unavailable."
        description="The applicant workspace could not load that application right now."
      >
        <Card className="rounded-[2rem] border border-border bg-background/70 shadow-sm">
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
              Couldn’t load this application
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              We couldn’t load that application detail page. It may have been
              removed, or you may not have access to it.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                onClick={() => {
                  void applicationQuery.refetch()
                }}
              >
                Retry
              </Button>
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link to="/applicant" />}
              >
                Back to application list
              </Button>
            </div>
          </CardContent>
        </Card>
      </ApplicantDetailShell>
    )
  }

  return (
    <ApplicantShell onSignedOut={onSignedOut}>
      <ApplicantApplicationWorkspace
        key={`${data.data.id}:${data.data.updatedAt ?? ""}`}
        application={data.data as WorkflowApplication}
        applicationId={applicationId}
        mode={mode}
      />
    </ApplicantShell>
  )
}

export function ApplicantApplicationDraftPage({
  onSignedOut,
}: {
  onSignedOut?: () => void
}) {
  return <ApplicantNewApplicationPage onSignedOut={onSignedOut} />
}

function ApplicantApplicationWorkspace({
  application,
  applicationId,
  mode,
}: {
  application: WorkflowApplication
  applicationId: number
  mode: "view" | "edit"
}) {
  useApplicationPageMeta(
    application,
    mode === "edit" ? "Edit draft application" : "Application detail",
  )

  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(() => toFormState(application))
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const updateDraft = useMutation({
    ...apiQuery.applicant.applications.update.mutationOptions(),
    onError: async (error) => {
      const details = await parseProblemDetails(error)
      const nextErrors = fieldErrorsFromDetails(details)
      setFieldErrors(nextErrors)
      if (!details.errors?.some((entry) => Boolean(entry.field))) {
        toast.error(details.detail ?? "We couldn’t save the draft right now.")
      }
      setSuccessMessage(null)
    },
  })

  const uploadAttachment = useMutation({
    ...apiQuery.applicant.applications.attachment.store.mutationOptions(),
    onError: async (error) => {
      const details = await parseProblemDetails(error)
      const nextErrors = fieldErrorsFromDetails(details)
      setFieldErrors(nextErrors)
      setSuccessMessage(null)
      if (!details.errors?.some((entry) => Boolean(entry.field))) {
        toast.error(
          details.detail ?? "We couldn’t upload the attachment right now."
        )
      }
    },
  })

  const submitApplication = useMutation({
    ...apiQuery.applicant.applications.submissions.store.mutationOptions(),
    onError: async (error) => {
      const details = await parseProblemDetails(error)
      toast.error(details.detail ?? "We couldn’t submit the application.")
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
      setSuccessMessage("Application submitted.")
      navigate(`/applicant/applications/${applicationId}`, { replace: true })
    },
  })

  const reopenDraft = useMutation({
    ...apiQuery.applicant.applicationDraftReopenings.store.mutationOptions(),
    onError: async (error) => {
      const details = await parseProblemDetails(error)
      toast.error(details.detail ?? "We couldn’t reopen the draft right now.")
    },
    onSuccess: (response) => {
      queryClient.setQueryData<{ data?: WorkflowApplication }>(
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
      toast.success("Draft reopened.")
    },
  })

  const isDraft = application.status === "draft"
  const isChangesRequested = application.status === "changes_requested"
  const canEdit =
    (mode === "edit" || location.pathname.endsWith("/edit")) && isDraft

  async function handleSaveDraft() {
    const numericAmount = Number(form.amount)
    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.description.trim() ||
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      setFieldErrors((current) => ({
        ...current,
        ...(form.title.trim() ? {} : { title: "Title is required." }),
        ...(form.category.trim() ? {} : { category: "Choose a category." }),
        ...(form.description.trim()
          ? {}
          : { description: "Description is required." }),
        ...(Number.isNaN(numericAmount) || numericAmount <= 0
          ? { amount: "Enter a valid positive amount." }
          : {}),
      }))
      setSuccessMessage(null)
      return
    }

    try {
      const savedDraft = await updateDraft.mutateAsync({
        params: { id: application.id },
        body: {
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim(),
          amount: numericAmount,
        },
      })

      queryClient.setQueryData(
        apiQuery.applicant.applications.show.queryKey({
          params: { id: applicationId },
        }),
        savedDraft
      )
      queryClient.invalidateQueries(
        apiQuery.applicant.applications.pathFilter()
      )
      setForm(toFormState(savedDraft.data as WorkflowApplication))
      setFieldErrors({})
      setSuccessMessage(null)

      if (attachmentFile) {
        const updatedWithAttachment = await uploadAttachment.mutateAsync({
          params: { id: application.id },
          body: {
            attachment: attachmentFile,
          },
        })

        queryClient.setQueryData(
          apiQuery.applicant.applications.show.queryKey({
            params: { id: applicationId },
          }),
          updatedWithAttachment
        )
        queryClient.invalidateQueries(
          apiQuery.applicant.applications.pathFilter()
        )
        setForm(toFormState(updatedWithAttachment.data as WorkflowApplication))
        setAttachmentFile(null)
        setSuccessMessage("Draft saved and attachment uploaded.")
      } else {
        setSuccessMessage("Draft saved.")
      }
    } catch {
      // Validation and transport errors are surfaced through the mutation callbacks.
    }
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
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
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
                    : (application.title ?? `Application #${application.id}`)}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
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
                  void handleSaveDraft()
                }}
              >
                <FieldGroup className="gap-5">
                  <Field data-invalid={Boolean(fieldErrors.title) || undefined}>
                    <FieldContent>
                      <FieldLabel htmlFor="application-title">Title</FieldLabel>
                      <FieldDescription id="application-title-description">
                        Give the application a clear working title for the
                        review queue.
                      </FieldDescription>
                      <Input
                        id="application-title"
                        value={form.title}
                        onChange={(event) => {
                          setForm((current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                          if (fieldErrors.title) {
                            setFieldErrors((current) => {
                              const { title: _title, ...rest } = current
                              return rest
                            })
                          }
                        }}
                        aria-invalid={Boolean(fieldErrors.title)}
                        aria-describedby={
                          fieldErrors.title
                            ? "application-title-description application-title-error"
                            : "application-title-description"
                        }
                      />
                      <FieldError id="application-title-error">
                        {fieldErrors.title}
                      </FieldError>
                    </FieldContent>
                  </Field>

                  <Field
                    data-invalid={Boolean(fieldErrors.category) || undefined}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="application-category">
                        Category
                      </FieldLabel>
                      <FieldDescription id="application-category-description">
                        Pick the one category that best fits the application.
                      </FieldDescription>
                      <RadioGroup
                        aria-label="Application category"
                        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                        value={form.category}
                        onValueChange={(nextValue) => {
                          const nextCategory = nextValue ?? ""
                          setForm((current) => ({
                            ...current,
                            category: nextCategory,
                          }))
                          if (fieldErrors.category) {
                            setFieldErrors((current) => {
                              const { category: _category, ...rest } = current
                              return rest
                            })
                          }
                        }}
                      >
                        {APPLICATION_CATEGORY_OPTIONS.map((option) => (
                          <label
                            key={option}
                            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-muted/40 has-data-[state=checked]:border-primary/40 has-data-[state=checked]:bg-primary/6"
                          >
                            <RadioGroupItem
                              value={option}
                              aria-label={option}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </RadioGroup>
                      <FieldError id="application-category-error">
                        {fieldErrors.category}
                      </FieldError>
                    </FieldContent>
                  </Field>

                  <Field
                    data-invalid={Boolean(fieldErrors.description) || undefined}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="application-description">
                        Description
                      </FieldLabel>
                      <FieldDescription id="application-description-description">
                        Explain what the reviewer needs to understand in order
                        to assess the application.
                      </FieldDescription>
                      <Textarea
                        id="application-description"
                        value={form.description}
                        onChange={(event) => {
                          setForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                          if (fieldErrors.description) {
                            setFieldErrors((current) => {
                              const { description: _description, ...rest } =
                                current
                              return rest
                            })
                          }
                        }}
                        aria-invalid={Boolean(fieldErrors.description)}
                        aria-describedby={
                          fieldErrors.description
                            ? "application-description-description application-description-error"
                            : "application-description-description"
                        }
                      />
                      <FieldError id="application-description-error">
                        {fieldErrors.description}
                      </FieldError>
                    </FieldContent>
                  </Field>

                  <Field
                    data-invalid={Boolean(fieldErrors.amount) || undefined}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="application-amount">
                        Amount
                      </FieldLabel>
                      <FieldDescription id="application-amount-description">
                        Enter the requested amount as a positive number.
                      </FieldDescription>
                      <Input
                        id="application-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={form.amount}
                        onChange={(event) => {
                          setForm((current) => ({
                            ...current,
                            amount: event.target.value,
                          }))
                          if (fieldErrors.amount) {
                            setFieldErrors((current) => {
                              const { amount: _amount, ...rest } = current
                              return rest
                            })
                          }
                        }}
                        aria-invalid={Boolean(fieldErrors.amount)}
                        aria-describedby={
                          fieldErrors.amount
                            ? "application-amount-description application-amount-error"
                            : "application-amount-description"
                        }
                      />
                      <FieldError id="application-amount-error">
                        {fieldErrors.amount}
                      </FieldError>
                    </FieldContent>
                  </Field>

                  <Field
                    data-invalid={Boolean(fieldErrors.attachment) || undefined}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="application-attachment">
                        Optional file attachment
                      </FieldLabel>
                      <FieldDescription id="application-attachment-description">
                        Upload one supporting file after saving the draft.
                        Allowed types are PDF, PNG, JPEG, and DOCX up to 5 MB.
                      </FieldDescription>
                      <Input
                        id="application-attachment"
                        type="file"
                        accept=".pdf,.png,.jpeg,.jpg,.docx,application/pdf,image/png,image/jpeg,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(event) => {
                          const nextFile = event.target.files?.[0] ?? null
                          setAttachmentFile(nextFile)
                          if (fieldErrors.attachment) {
                            setFieldErrors((current) => {
                              const { attachment: _attachment, ...rest } =
                                current
                              return rest
                            })
                          }
                        }}
                        aria-invalid={Boolean(fieldErrors.attachment)}
                        aria-describedby={
                          fieldErrors.attachment
                            ? "application-attachment-description application-attachment-error"
                            : "application-attachment-description"
                        }
                      />
                      {attachmentFile ? (
                        <Badge variant="secondary">
                          Selected: {attachmentFile.name}
                        </Badge>
                      ) : application.attachmentUrl ? (
                        <Badge
                          variant="outline"
                          render={
                            <a
                              href={application.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open attachment
                            </a>
                          }
                        />
                      ) : null}
                      <FieldError id="application-attachment-error">
                        {fieldErrors.attachment}
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/applicant/applications/new")}
                  >
                    Start a new draft
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    Draft details
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    These are the fields reviewers will see after you submit.
                  </p>
                </div>

                <Separator className="bg-border/70" />

                <dl className="grid gap-4">
                  {[
                    {
                      label: "Title",
                      value: application.title,
                      span: "md:col-span-2",
                    },
                    {
                      label: "Category",
                      value: application.category,
                    },
                    {
                      label: "Amount",
                      value: formatAmount(application.amount),
                    },
                  ].map((field) => (
                    <div
                      key={field.label}
                      className={`grid gap-1 rounded-2xl border border-border bg-background/80 px-4 py-4 ${field.span ?? ""}`}
                    >
                      <dt className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                        {field.label}
                      </dt>
                      <dd className="text-sm leading-6 font-medium text-foreground">
                        {field.value ?? "Not provided yet"}
                      </dd>
                    </div>
                  ))}

                  <div className="grid gap-1 rounded-2xl border border-border bg-background/80 px-4 py-4 md:col-span-2">
                    <dt className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                      Description
                    </dt>
                    <dd className="text-sm leading-6 text-foreground">
                      {application.description ?? "Not provided yet"}
                    </dd>
                  </div>

                  <div className="rounded-2xl border border-border bg-background/80 px-4 py-4 md:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                          Attachment
                        </p>
                        <p className="text-sm leading-6 text-foreground">
                          {application.attachmentUrl
                            ? "A file is attached and will be visible to reviewers."
                            : "No attachment uploaded yet."}
                        </p>
                      </div>
                      {application.attachmentUrl ? (
                        <Badge
                          variant="outline"
                          render={
                            <a
                              href={application.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open file
                            </a>
                          }
                        />
                      ) : null}
                    </div>
                  </div>
                </dl>
              </div>
            )}
          </CardContent>
        </Card>

        <WorkflowTimeline
          eyebrow="Audit Logs"
          title="Application timeline"
          emptyMessage="No workflow transitions yet."
          history={application.history}
        />
      </div>
    </>
  )
}

function ApplicantShell({
  onSignedOut,
  children,
}: {
  onSignedOut?: () => void
  children: ReactNode
}) {
  return (
    <AuthenticatedShell role="applicant" onSignedOut={onSignedOut}>
      <div className="flex flex-col gap-8">{children}</div>
    </AuthenticatedShell>
  )
}

function ApplicantDetailShell({
  eyebrow,
  title,
  description,
  onSignedOut,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  onSignedOut?: () => void
  children: ReactNode
}) {
  return (
    <AuthenticatedShell role="applicant" onSignedOut={onSignedOut}>
      <div className="flex flex-col gap-8">
        <section className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </section>

        {children}
      </div>
    </AuthenticatedShell>
  )
}

function ApplicantLoadingPanel({ body }: { body: string }) {
  return (
    <Card className="rounded-[2rem] border border-border">
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-4 w-32 rounded-none" />
        <Skeleton className="h-12 w-full rounded-none" />
        <p className="text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}

