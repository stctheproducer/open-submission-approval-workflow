export type ReviewState = "ready" | "owned"

export type WorkflowActor = {
  id?: number
  fullName?: string | null
  email?: string | null
}

export type WorkflowTransition = {
  id: number
  previousStatus: string | null
  nextStatus: string
  comment?: string | null
  createdAt?: string
  actor?: WorkflowActor | null
}

export type WorkflowApplication = {
  id: number
  title?: string | null
  category?: string | null
  description?: string | null
  amount?: number | string | null
  status: string
  reviewState?: string
  applicant?: WorkflowActor | null
  assignedReviewer?: WorkflowActor | null
  reviewer?: WorkflowActor | null
  history?: WorkflowTransition[]
  statusTransitions?: WorkflowTransition[]
  createdAt?: string
  updatedAt?: string
  attachmentUrl?: string | null
}

export function humanizeStatus(status: string) {
  const phrase = status.split("_").join(" ")
  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}`
}

export function humanizeReviewState(reviewState?: string | null) {
  switch (reviewState) {
    case "ready":
      return "Ready"
    case "owned":
      return "Owned by you"
    default:
      return "In queue"
  }
}

export function formatAmount(amount?: number | string | null) {
  if (amount === null || amount === undefined || amount === "") {
    return "Not provided"
  }

  const numericAmount = typeof amount === "string" ? Number(amount) : amount

  if (Number.isNaN(numericAmount)) {
    return String(amount)
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ZMW",
    maximumFractionDigits: 0,
  }).format(numericAmount)
}

export function formatDate(value?: string) {
  if (!value) {
    return "No timestamp recorded"
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function formatTimelineLabel(entry: WorkflowTransition) {
  const from = entry.previousStatus ? humanizeStatus(entry.previousStatus) : "Created"
  return `${from} -> ${humanizeStatus(entry.nextStatus)}`
}

export function getStatusTone(status: string) {
  switch (status) {
    case "draft":
      return "border-amber-300/60 bg-amber-100/70 text-amber-900"
    case "submitted":
      return "border-sky-300/60 bg-sky-100/70 text-sky-950"
    case "changes_requested":
      return "border-orange-300/60 bg-orange-100/80 text-orange-950"
    case "approved":
      return "border-emerald-300/60 bg-emerald-100/80 text-emerald-950"
    case "rejected":
      return "border-rose-300/60 bg-rose-100/80 text-rose-950"
    default:
      return "border-border bg-muted text-foreground"
  }
}

export function getReviewStateTone(reviewState?: string | null) {
  switch (reviewState) {
    case "ready":
      return "border-sky-300/60 bg-sky-100/70 text-sky-950"
    case "owned":
      return "border-emerald-300/60 bg-emerald-100/70 text-emerald-950"
    default:
      return "border-border bg-muted text-foreground"
  }
}

export function queueItemLabel(application: Pick<WorkflowApplication, "id" | "title">) {
  return application.title ?? `Application #${application.id}`
}

export function canStartReview(application?: Pick<WorkflowApplication, "status" | "reviewState">) {
  return application?.status === "submitted" && application.reviewState === "ready"
}

export function canApprove(application?: Pick<WorkflowApplication, "status" | "reviewState">) {
  return application?.status === "under_review" && application.reviewState === "owned"
}
