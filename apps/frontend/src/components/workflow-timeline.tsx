import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TimelineSteps,
  TimelineStepsContent,
  TimelineStepsDescription,
  TimelineStepsHeader,
  TimelineStepsIcon,
  TimelineStepsItem,
  TimelineStepsTime,
  TimelineStepsTitle,
} from "@/components/ui/timeline-steps"
import {
  formatDate,
  formatTimelineLabel,
  humanizeStatus,
  type WorkflowTransition,
} from "@/lib/review-workflow"

function getTimelineVariant(status?: string) {
  switch (status) {
    case "approved":
      return "primary"
    case "rejected":
      return "destructive"
    case "changes_requested":
      return "secondary"
    case "under_review":
      return "outline"
    default:
      return "default"
  }
}

function getActorInitials(name?: string | null) {
  if (!name) {
    return "AI"
  }

  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return "AI"
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function WorkflowTimeline({
  eyebrow,
  title,
  emptyMessage,
  history,
}: {
  eyebrow: string
  title: string
  emptyMessage: string
  history?: WorkflowTransition[]
}) {
  return (
    <Card className="rounded-[1.75rem] border border-border bg-muted/30">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
            {eyebrow}
          </p>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h3>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {(history ?? []).length > 0 ? (
          <TimelineSteps className="gap-0">
            {history?.map((entry, index) => (
              <TimelineEntry key={entry.id} entry={entry} />
            ))}
          </TimelineSteps>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}

function TimelineEntry({
  entry,
}: {
  entry: WorkflowTransition
}) {
  const statusLabel = humanizeStatus(entry.nextStatus)

  return (
    <TimelineStepsItem className="pb-4 last:pb-0">
      <div className="grid gap-3 rounded-[1.5rem] border border-border bg-background/70 px-5 py-5 shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <TimelineStepsHeader className="items-start gap-3">
            <TimelineStepsIcon variant={getTimelineVariant(entry.nextStatus)}>
              {getActorInitials(entry.actor?.fullName)}
            </TimelineStepsIcon>
            <div className="flex flex-col gap-1">
              <TimelineStepsTitle>{formatTimelineLabel(entry)}</TimelineStepsTitle>
              <TimelineStepsDescription>
                {entry.actor?.fullName
                  ? `${entry.actor.fullName}${entry.actor.email ? ` · ${entry.actor.email}` : ""}`
                  : "System event"}
              </TimelineStepsDescription>
            </div>
          </TimelineStepsHeader>
          <Badge variant="outline">{statusLabel}</Badge>
        </div>

        <div className="grid gap-2">
          {entry.comment ? (
            <p className="text-sm leading-6 text-foreground">{entry.comment}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No reviewer comment recorded.
            </p>
          )}
          <TimelineStepsTime dateTime={entry.createdAt}>
            {formatDate(entry.createdAt)}
          </TimelineStepsTime>
        </div>
      </div>
    </TimelineStepsItem>
  )
}
