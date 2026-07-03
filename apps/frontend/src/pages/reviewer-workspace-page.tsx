import type { ReactNode } from "react"
import { Link, useParams } from "react-router"
import { ArrowLeft, CheckCircle2, Filter, Play, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  formatAmount,
  formatDate,
  formatTimelineLabel,
  getReviewStateTone,
  getStatusTone,
  humanizeReviewState,
  humanizeStatus,
  queueItemLabel,
} from "@/lib/review-workflow"
import { cn } from "@/lib/utils"

import { useReviewerWorkspace } from "./use-reviewer-workspace"

function ReviewerAppShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="relative isolate min-h-svh overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,_rgba(95,161,125,0.16),_transparent_28%),radial-gradient(circle_at_88%_18%,_rgba(124,139,168,0.12),_transparent_30%),linear-gradient(180deg,_var(--background)_0%,_color-mix(in_oklch,var(--background),var(--muted)_8%)_100%)]" />
        <div className="relative mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12">
          <section className="rounded-[2rem] border border-border/80 bg-card/96 p-8 shadow-sm backdrop-blur">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                {eyebrow}
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>
          </section>

          {children}
        </div>
      </div>
    </main>
  )
}

function RecordCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{label}</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
    </div>
  )
}

export function ReviewerWorkspacePage() {
  const { activeReviewState, actionError, queueQuery, reviewQueue, setReviewFilter, startReview, isStartingReview } =
    useReviewerWorkspace({
      includeApplication: false,
      includeQueue: true,
      navigateToDetailOnStartReview: true,
    })

  if (queueQuery.isLoading) {
    return (
      <ReviewerAppShell
        eyebrow="Reviewer area"
        title="Your queue is loading."
        description="Fetch the current queue and start with the work that is ready for review."
      >
        <section className="rounded-[2rem] border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">Loading review queue…</p>
        </section>
      </ReviewerAppShell>
    )
  }

  if (queueQuery.error || !reviewQueue) {
    return (
      <ReviewerAppShell
        eyebrow="Reviewer area"
        title="Your queue is unavailable."
        description="The reviewer workspace could not load its queue right now."
      >
        <section className="rounded-[2rem] border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">We couldn’t load the review queue.</p>
        </section>
      </ReviewerAppShell>
    )
  }

  return (
    <ReviewerAppShell
      eyebrow="Reviewer area"
      title="Review work in one place."
      description="The queue shows submitted applications plus the work assigned to you. Start review from the queue, then decide with the application timeline in view."
    >
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                    Queue overview
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                    Review queue
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Keep the queue filtered to what you need, then open an application to check its
                    history and act with confidence.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Queue size
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {reviewQueue.metadata.total}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Page {reviewQueue.metadata.currentPage} of {reviewQueue.metadata.lastPage}
                  </p>
                </div>
              </div>

              {actionError ? (
                <p
                  role="alert"
                  className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {actionError}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => {
                    setReviewFilter(null)
                  }}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    !activeReviewState
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted",
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReviewFilter("ready")
                  }}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    activeReviewState === "ready"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted",
                  )}
                >
                  Ready
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReviewFilter("owned")
                  }}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    activeReviewState === "owned"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted",
                  )}
                >
                  Owned
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "All",
                    description: "Submitted work and your in-review queue items.",
                    active: !activeReviewState,
                  },
                  {
                    label: "Ready",
                    description: "Submitted applications without an owner.",
                    active: activeReviewState === "ready",
                  },
                  {
                    label: "Owned",
                    description: "Applications currently assigned to you.",
                    active: activeReviewState === "owned",
                  },
                ].map((filter) => (
                  <div
                    key={filter.label}
                    className={cn(
                      "rounded-2xl border p-4 text-sm",
                      filter.active ? "border-primary/30 bg-primary/8" : "border-border bg-muted/30",
                    )}
                  >
                    <p className="font-semibold text-foreground">{filter.label}</p>
                    <p className="mt-2 text-muted-foreground">{filter.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {reviewQueue.data.map((application) => {
              const isReady = application.reviewState === "ready"
              const isOwned = application.reviewState === "owned"

              return (
                <article
                  key={application.id}
                  className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm transition hover:border-primary/35"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <Link
                        to={`/reviewer/applications/${application.id}`}
                        className="text-2xl font-semibold tracking-tight text-foreground underline-offset-4 hover:underline"
                      >
                        {queueItemLabel(application)}
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>
                          {application.applicant?.fullName ??
                            application.contactName ??
                            "No applicant name yet"}
                        </span>
                        <span>•</span>
                        <span>{application.contactEmail ?? "No contact email"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
                          getStatusTone(application.status),
                        )}
                      >
                        {humanizeStatus(application.status)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
                          getReviewStateTone(application.reviewState),
                        )}
                      >
                        {humanizeReviewState(application.reviewState)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                        Contact
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {application.contactName ?? "No contact name"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {application.contactEmail ?? "No contact email"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                        Category
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {application.category ?? "Uncategorized"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatAmount(application.amount)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                        Workflow
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {isReady
                          ? "Start review to claim this application."
                          : isOwned
                            ? "This application is assigned to you."
                            : "No reviewer state available."}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Updated {formatDate(application.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {isReady ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          startReview(application.id)
                        }}
                        disabled={isStartingReview(application.id)}
                      >
                        {isStartingReview(application.id) ? "Starting review…" : "Start review"}
                      </Button>
                    ) : null}

                    <Link
                      to={`/reviewer/applications/${application.id}`}
                      className={cn(
                        "group/button inline-flex h-9 shrink-0 items-center justify-center gap-1 border border-border bg-transparent px-4 text-xs font-semibold whitespace-nowrap uppercase tracking-widest text-foreground transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
                      )}
                    >
                      Open detail
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-border bg-[linear-gradient(180deg,_var(--card)_0%,_var(--muted)_100%)] p-8 shadow-sm">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Queue rules
              </p>
              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>Ready items are submitted work without an owner.</p>
                <p>Owned items are the applications currently assigned to you.</p>
                <p>Use the filter pills to narrow the queue without changing the workflow order.</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Decision surface
              </p>
              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>
                  Starting review moves a ready application into your owned queue and keeps the
                  audit trail visible on the detail page.
                </p>
                <p>
                  Approval only appears after the application is under review and assigned to you.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </ReviewerAppShell>
  )
}

export function ReviewerApplicationPage() {
  const params = useParams()
  const applicationId = Number(params.id)
  const {
    actionError,
    application,
    applicationQuery,
    approveCurrentApplication,
    canApprove,
    canStartReview,
    isApprovalPending,
    isStartReviewPending,
    startCurrentApplicationReview,
  } = useReviewerWorkspace({
    applicationId,
    includeQueue: false,
    includeApplication: true,
  })

  if (applicationQuery.isLoading) {
    return (
      <ReviewerAppShell
        eyebrow="Reviewer area"
        title="Loading application detail."
        description="Pulling the current application and its audit history into the review workspace."
      >
        <section className="rounded-[2rem] border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">Loading application detail…</p>
        </section>
      </ReviewerAppShell>
    )
  }

  if (applicationQuery.error || !application) {
    return (
      <ReviewerAppShell
        eyebrow="Reviewer area"
        title="Application detail unavailable."
        description="The reviewer workspace could not load that application right now."
      >
        <section className="rounded-[2rem] border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">We couldn’t load that reviewer detail page.</p>
        </section>
      </ReviewerAppShell>
    )
  }

  const title = application.title ?? application.organizationName ?? `Application #${application.id}`

  return (
    <ReviewerAppShell
      eyebrow="Reviewer area"
      title={title}
      description="Review the current record, check the embedded timeline, and use the deliberate workflow actions from one place."
    >
      <div className="space-y-6">
        <Link
          to="/reviewer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to queue
        </Link>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                  Application detail
                </p>
                <h2 className="text-4xl font-semibold tracking-tight text-foreground">
                  {title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
                      getStatusTone(application.status),
                    )}
                  >
                    {humanizeStatus(application.status)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
                      getReviewStateTone(application.reviewState),
                    )}
                  >
                    {humanizeReviewState(application.reviewState)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {canStartReview ? (
                  <Button size="sm" onClick={startCurrentApplicationReview} disabled={isStartReviewPending}>
                    <Play className="size-3.5" aria-hidden="true" />
                    {isStartReviewPending ? "Starting review…" : "Start review"}
                  </Button>
                ) : null}

                {canApprove ? (
                  <Button size="sm" onClick={approveCurrentApplication} disabled={isApprovalPending}>
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    {isApprovalPending ? "Approving…" : "Approve application"}
                  </Button>
                ) : null}
              </div>
            </div>

            {actionError ? (
              <p
                role="alert"
                className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {actionError}
              </p>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <RecordCard label="Applicant" value={application.applicant?.fullName ?? "No applicant name"} />
              <RecordCard
                label="Assigned reviewer"
                value={application.assignedReviewer?.fullName ?? "Unassigned"}
              />
              <RecordCard label="Contact email" value={application.contactEmail ?? "No contact email"} />
              <RecordCard label="Category" value={application.category ?? "Uncategorized"} />
              <RecordCard label="Amount" value={formatAmount(application.amount)} />
              <RecordCard label="Updated" value={formatDate(application.updatedAt)} />
            </div>

            <div className="rounded-[1.75rem] border border-border bg-muted/30 p-6">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">Description</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {application.description ?? "No description provided."}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-muted/30 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                    Workflow action
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                    Decision availability
                  </h3>
                </div>
                <div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {canApprove ? "Approval available" : "Approval locked"}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {canApprove
                  ? "You can approve this application because it is under review and assigned to you."
                  : "Approval appears only after you start review and the application is assigned to you."}
              </p>
            </div>
          </div>

          <section className="space-y-6 rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Embedded audit
              </p>
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                Application timeline
              </h3>
            </div>

            <div className="space-y-4">
              {(application.history ?? []).length > 0 ? (
                application.history?.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-[1.5rem] border border-border bg-muted/30 p-5"
                  >
                    <p className="text-sm font-semibold text-foreground">{formatTimelineLabel(entry)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDate(entry.createdAt)}</p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {entry.actor?.fullName ?? "Workflow actor"}
                    </p>
                    {entry.comment ? (
                      <p className="mt-3 text-sm leading-6 text-foreground">{entry.comment}</p>
                    ) : null}
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No workflow transitions yet.</p>
              )}
            </div>
          </section>
        </section>

        <section className="rounded-[2rem] border border-border bg-[linear-gradient(180deg,_var(--card)_0%,_var(--muted)_100%)] p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <UserRound className="size-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Workflow state
            </p>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {application.status === "approved"
              ? "This application is approved and the reviewer decision trail is locked."
              : canApprove
                ? "The application is assigned to you and ready for approval."
                : canStartReview
                  ? "The application is ready. Start review to claim it before approving."
                  : "This application is not currently eligible for a reviewer action."}
          </p>
        </section>
      </div>
    </ReviewerAppShell>
  )
}
