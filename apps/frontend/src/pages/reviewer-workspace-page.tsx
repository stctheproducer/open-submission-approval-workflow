import { type ReactNode, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { ArrowLeft, CheckCircle2, Inbox, Play } from "lucide-react"

import { ReviewStateFilter } from "@/components/review-state-filter"
import { CardTotalBadge } from "@/components/card-total-badge"
import { QueuePaginationControls } from "@/components/queue-pagination"
import {
  ApplicationStatusBadge,
  ReviewStateBadge,
} from "@/components/workflow-badge"
import { AuthenticatedShell } from "@/components/authenticated-shell"
import { WorkflowTimeline } from "@/components/workflow-timeline"
import { ErrorAlert } from "@/components/workspace-alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  formatAmount,
  formatDate,
  queueItemLabel,
  type WorkflowApplication,
} from "@/lib/review-workflow"

import { useReviewerWorkspace } from "./use-reviewer-workspace"
import { useApplicationPageMeta } from "@/routing/page-meta"

function ReviewerAppShell({
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
    <AuthenticatedShell role="reviewer" onSignedOut={onSignedOut}>
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

function RecordCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 rounded-2xl border border-border bg-background/80 px-4 py-4">
      <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
        {label}
      </p>
      <p className="text-sm leading-6 text-foreground">{value}</p>
    </div>
  )
}

function LoadingPanel({ body }: { body: string }) {
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

function QueueOverviewCard({ total }: { total: number }) {
  return (
    <Card className="relative rounded-[2rem] border border-border shadow-sm">
      <CardTotalBadge total={total} label={`${total} applications in queue`} />
      <CardContent className="flex flex-wrap items-end justify-between gap-6 pr-16">
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
            Queue overview
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Review queue
          </h2>
          <CardDescription className="text-sm leading-6">
            Keep the queue filtered to what you need, then open an application
            to check its history and act with confidence.
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  )
}

function MetaTile({
  label,
  primary,
  secondary,
}: {
  label: string
  primary: string
  secondary: string
}) {
  return (
    <Card className="rounded-2xl border border-border bg-muted/30 p-4 shadow-none">
      <CardHeader className="gap-2">
        <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
          {label}
        </p>
        <CardDescription className="text-sm text-foreground">
          {primary}
        </CardDescription>
        <CardDescription className="text-sm text-muted-foreground">
          {secondary}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

function QueueItemCard({
  application,
  onStartReview,
  isStartingReview,
}: {
  application: WorkflowApplication
  onStartReview: (applicationId: number) => void
  isStartingReview: (applicationId: number) => boolean
}) {
  const isReady = application.reviewState === "ready"
  const isOwned = application.reviewState === "owned"

  return (
    <Card className="rounded-[1.75rem] border border-border py-6 shadow-sm transition hover:border-primary/35">
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {application.category ?? "Uncategorized"}
              </Badge>
              <Badge variant="outline">
                {formatAmount(application.amount)}
              </Badge>
            </div>
            <Link
              to={`/reviewer/applications/${application.id}`}
              className="text-2xl font-semibold tracking-tight text-foreground underline-offset-4 hover:underline"
            >
              {queueItemLabel(application)}
            </Link>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {application.applicant?.fullName
                ? `${application.applicant.fullName}${application.applicant.email ? ` · ${application.applicant.email}` : ""}`
                : "No applicant name"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ApplicationStatusBadge status={application.status} />
            <ReviewStateBadge reviewState={application.reviewState} />
          </div>
        </div>

        <Separator className="bg-border/70" />

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1">
            <span className="font-medium text-foreground">Workflow</span>
            <span>
              {isReady
                ? "Start review to claim this application."
                : isOwned
                  ? "This application is assigned to you."
                  : "No reviewer state available."}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1">
            <span className="font-medium text-foreground">Updated</span>
            <span>{formatDate(application.updatedAt)}</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {isReady ? (
            <Button
              size="sm"
              onClick={() => {
                onStartReview(application.id)
              }}
              disabled={isStartingReview(application.id)}
            >
              {isStartingReview(application.id)
                ? "Starting review…"
                : "Start review"}
            </Button>
          ) : null}

          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link to={`/reviewer/applications/${application.id}`} />}
          >
            Open detail
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyQueueState({ onReload }: { onReload: () => void }) {
  return (
    <Card className="rounded-[1.75rem] border border-border/70 bg-background/60 shadow-none">
      <CardContent className="flex flex-col gap-6 px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
              No items in queue
            </p>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
              Nothing is ready for review yet.
            </h3>
          </div>
          <Button size="sm" variant="outline" onClick={onReload}>
            Reload queue
          </Button>
        </div>

        <div className="grid gap-4 rounded-[1.5rem] bg-background/80 p-4 shadow-none sm:grid-cols-[auto,1fr] sm:items-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Inbox className="size-8" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
              Waiting for submissions
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              New applications will appear here once applicants submit them. Use
              the queue controls above to filter between ready and owned work
              when the list fills up.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SidebarNoteCard({
  title,
  gradient = false,
  children,
}: {
  title: string
  gradient?: boolean
  children: ReactNode
}) {
  return (
    <section
      className={
        gradient
          ? "rounded-[2rem] border border-border/70 bg-muted/30 px-5 py-5 shadow-none"
          : "rounded-[2rem] border border-border/70 bg-background/70 px-5 py-5 shadow-none"
      }
    >
      <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
        {title}
      </p>
      <div className="mt-3 flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

function DecisionCommentCard({
  decisionComment,
  setDecisionComment,
  decisionCommentError,
  clearDecisionCommentError,
  canRequestChanges,
  canReject,
  isDecisionPending,
  isChangeRequestPending,
  isRejectionPending,
  onRequestChanges,
  onReject,
}: {
  decisionComment: string
  setDecisionComment: (next: string) => void
  decisionCommentError: string | null
  clearDecisionCommentError: () => void
  canRequestChanges: boolean
  canReject: boolean
  isDecisionPending: boolean
  isChangeRequestPending: boolean
  isRejectionPending: boolean
  onRequestChanges: () => void
  onReject: () => void
}) {
  const trimmedDecisionComment = decisionComment.trim()
  const commentRequired = trimmedDecisionComment.length === 0

  return (
    <section className="rounded-[1.75rem] border border-border bg-muted/20 px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
            Decision comment
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Required for request changes and rejection
          </h3>
        </div>
        <div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          {canRequestChanges ? "Approval available" : "Approval locked"}
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        Add the reason once. We’ll attach it to the workflow history when you
        request changes or reject the application.
      </p>

      <Separator className="my-6 bg-border/70" />

      <FieldGroup>
        <Field data-invalid={Boolean(decisionCommentError) || undefined}>
          <FieldContent>
            <FieldLabel htmlFor="reviewer-decision-comment">
              Decision comment
            </FieldLabel>
            <FieldDescription id="reviewer-decision-comment-description">
              Required before taking a decision.
            </FieldDescription>
            <Textarea
              id="reviewer-decision-comment"
              value={decisionComment}
              onChange={(event) => {
                setDecisionComment(event.target.value)
                if (decisionCommentError) {
                  clearDecisionCommentError()
                }
              }}
              disabled={!canRequestChanges || isDecisionPending}
              rows={4}
              placeholder="What should change or why should this be rejected?"
              aria-invalid={Boolean(decisionCommentError)}
              aria-describedby={
                decisionCommentError
                  ? "reviewer-decision-comment-description reviewer-decision-comment-error"
                  : "reviewer-decision-comment-description"
              }
            />
            <FieldError id="reviewer-decision-comment-error">
              {decisionCommentError}
            </FieldError>
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={onRequestChanges}
          disabled={!canRequestChanges || commentRequired || isDecisionPending}
        >
          {isChangeRequestPending ? "Requesting changes…" : "Request changes"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={!canReject || commentRequired || isDecisionPending}
        >
          {isRejectionPending ? "Rejecting…" : "Reject application"}
        </Button>
      </div>
    </section>
  )
}

export function ReviewerWorkspacePage({
  onSignedOut,
}: {
  onSignedOut?: () => void
}) {
  const {
    activeReviewState,
    actionError,
    queueQuery,
    reviewQueue,
    refetchQueue,
    setQueuePage,
    setQueuePerPage,
    setReviewFilter,
    startReview,
    isStartingReview,
  } = useReviewerWorkspace({
    includeApplication: false,
    includeQueue: true,
    navigateToDetailOnStartReview: true,
  })

  if (queueQuery.isLoading) {
    return (
      <ReviewerAppShell
        onSignedOut={onSignedOut}
        eyebrow="Reviewer area"
        title="Your queue is loading."
        description="Fetch the current queue and start with the work that is ready for review."
      >
        <LoadingPanel body="Loading review queue…" />
      </ReviewerAppShell>
    )
  }

  if (queueQuery.error || !reviewQueue) {
    return (
      <ReviewerAppShell
        onSignedOut={onSignedOut}
        eyebrow="Reviewer area"
        title="Your queue is unavailable."
        description="The reviewer workspace could not load its queue right now."
      >
        <LoadingPanel body="We couldn’t load the review queue." />
      </ReviewerAppShell>
    )
  }

  return (
    <ReviewerAppShell
      onSignedOut={onSignedOut}
      eyebrow="Reviewer area"
      title="Review work in one place."
      description="The queue shows submitted applications plus the work assigned to you. Start review from the queue, then decide with the application timeline in view."
    >
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="flex flex-col gap-6">
          <QueueOverviewCard total={reviewQueue.metadata.total} />

          <div className="flex flex-col gap-4">
            {actionError ? <ErrorAlert>{actionError}</ErrorAlert> : null}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <ReviewStateFilter
                value={activeReviewState}
                onValueChange={setReviewFilter}
              />
              <QueuePaginationControls
                currentPage={reviewQueue.metadata.currentPage}
                lastPage={reviewQueue.metadata.lastPage}
                perPage={reviewQueue.metadata.perPage}
                onPageChange={setQueuePage}
                onPerPageChange={setQueuePerPage}
              />
            </div>
          </div>

          {reviewQueue.data.length > 0 ? (
            <div className="grid gap-4">
              {reviewQueue.data.map((application) => (
                <QueueItemCard
                  key={application.id}
                  application={application}
                  onStartReview={startReview}
                  isStartingReview={isStartingReview}
                />
              ))}
            </div>
          ) : (
            <EmptyQueueState
              onReload={() => {
                void refetchQueue()
              }}
            />
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <SidebarNoteCard title="Queue rules" gradient>
            <p>Ready items are submitted work without an owner.</p>
            <p>Owned items are the applications currently assigned to you.</p>
            <p>Use the filter pills to narrow the queue.</p>
          </SidebarNoteCard>

          <SidebarNoteCard title="Decision surface">
            <p>Starting review moves a ready application into your queue.</p>
            <p>Approval only appears after assignment.</p>
          </SidebarNoteCard>
        </aside>
      </section>
    </ReviewerAppShell>
  )
}

export function ReviewerApplicationPage({
  onSignedOut,
}: {
  onSignedOut?: () => void
}) {
  const params = useParams()
  const navigate = useNavigate()
  const applicationId = Number(params.id)
  const {
    actionError,
    application,
    applicationQuery,
    approveCurrentApplication,
    canApprove,
    canReject,
    canRequestChanges,
    canStartReview,
    isApprovalPending,
    isChangeRequestPending,
    isRejectionPending,
    isStartReviewPending,
    rejectCurrentApplication,
    requestChangesCurrentApplication,
    startCurrentApplicationReview,
  } = useReviewerWorkspace({
    applicationId,
    includeQueue: false,
    includeApplication: true,
  })
  useApplicationPageMeta(application, "Review application")
  const [decisionComment, setDecisionComment] = useState("")
  const [decisionCommentError, setDecisionCommentError] = useState<
    string | null
  >(null)

  if (applicationQuery.isLoading) {
    return (
      <ReviewerAppShell
        onSignedOut={onSignedOut}
        eyebrow="Reviewer area"
        title="Loading application detail."
        description="Pulling the current application and its audit history into the review workspace."
      >
        <LoadingPanel body="Loading application detail…" />
      </ReviewerAppShell>
    )
  }

  if (applicationQuery.error || !application) {
    return (
      <ReviewerAppShell
        onSignedOut={onSignedOut}
        eyebrow="Reviewer area"
        title="Application detail unavailable."
        description="The reviewer workspace could not load that application right now."
      >
        <Card className="rounded-[2rem] border border-border bg-background/70 shadow-sm">
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
              Couldn’t load this application
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              We couldn’t load that reviewer detail page.
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
                render={<Link to="/reviewer" />}
              >
                Back to review list
              </Button>
            </div>
          </CardContent>
        </Card>
      </ReviewerAppShell>
    )
  }

  const title = application.title ?? `Application #${application.id}`
  const trimmedDecisionComment = decisionComment.trim()
  const isDecisionPending = isChangeRequestPending || isRejectionPending

  function getDecisionComment() {
    if (trimmedDecisionComment.length > 0) {
      setDecisionCommentError(null)
      return trimmedDecisionComment
    }

    setDecisionCommentError(
      "Enter a comment before requesting changes or rejecting."
    )
    return null
  }

  async function handleRequestChanges() {
    const comment = getDecisionComment()
    if (!comment) {
      return
    }

    await requestChangesCurrentApplication(comment)
  }

  async function handleReject() {
    const comment = getDecisionComment()
    if (!comment) {
      return
    }

    await rejectCurrentApplication(comment)
  }

  return (
    <ReviewerAppShell
      onSignedOut={onSignedOut}
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
          <Card className="rounded-[2rem] border border-border shadow-sm">
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
                    Application detail
                  </p>
                  <h2 className="text-4xl font-semibold tracking-tight text-foreground">
                    {title}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <ApplicationStatusBadge status={application.status} />
                    <ReviewStateBadge reviewState={application.reviewState} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {canStartReview ? (
                    <Button
                      size="sm"
                      onClick={startCurrentApplicationReview}
                      disabled={isStartReviewPending}
                    >
                      <Play data-icon="inline-start" aria-hidden="true" />
                      {isStartReviewPending
                        ? "Starting review…"
                        : "Start review"}
                    </Button>
                  ) : null}

                  {canApprove ? (
                    <Button
                      size="sm"
                      onClick={approveCurrentApplication}
                      disabled={isApprovalPending}
                    >
                      <CheckCircle2
                        data-icon="inline-start"
                        aria-hidden="true"
                      />
                      {isApprovalPending ? "Approving…" : "Approve application"}
                    </Button>
                  ) : null}
                </div>
              </div>

              <Separator className="bg-border/70" />

              {actionError ? (
                <ErrorAlert
                  action={{
                    label: "Back to review list",
                    onClick: () => {
                      navigate("/reviewer", { replace: true })
                    },
                  }}
                >
                  {actionError}
                </ErrorAlert>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <RecordCard
                  label="Applicant"
                  value={application.applicant?.fullName ?? "No applicant name"}
                />
                <RecordCard
                  label="Assigned reviewer"
                  value={application.assignedReviewer?.fullName ?? "Unassigned"}
                />
                <RecordCard
                  label="Category"
                  value={application.category ?? "Uncategorized"}
                />
                <RecordCard
                  label="Amount"
                  value={formatAmount(application.amount)}
                />
                <RecordCard
                  label="Attachment"
                  value={
                    application.attachmentUrl ? (
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
                    ) : (
                      "No attachment uploaded"
                    )
                  }
                />
                <RecordCard
                  label="Updated"
                  value={formatDate(application.updatedAt)}
                />
              </div>

              <section className="rounded-[1.75rem] border border-border bg-background/80 px-5 py-5">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  Description
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {application.description ?? "No description provided."}
                </p>
              </section>

              <DecisionCommentCard
                decisionComment={decisionComment}
                setDecisionComment={setDecisionComment}
                decisionCommentError={decisionCommentError}
                clearDecisionCommentError={() => {
                  setDecisionCommentError(null)
                }}
                canRequestChanges={canRequestChanges}
                canReject={canReject}
                isDecisionPending={isDecisionPending}
                isChangeRequestPending={isChangeRequestPending}
                isRejectionPending={isRejectionPending}
                onRequestChanges={() => {
                  void handleRequestChanges()
                }}
                onReject={() => {
                  void handleReject()
                }}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <SidebarNoteCard title="Workflow state" gradient>
              <p className="text-sm leading-6 text-muted-foreground">
                {application.status === "approved"
                  ? "This application is approved and the reviewer decision trail is locked."
                  : canApprove
                    ? "The application is assigned to you and ready for approval, change request, or rejection with a required comment."
                    : canStartReview
                      ? "The application is ready. Start review to claim it before approving."
                      : "This application is not currently eligible for a reviewer action."}
              </p>
            </SidebarNoteCard>
            <WorkflowTimeline
              eyebrow="Audit Logs"
              title="Application timeline"
              emptyMessage="No workflow transitions yet."
              history={application.history}
            />
          </div>
        </section>
      </div>
    </ReviewerAppShell>
  )
}
