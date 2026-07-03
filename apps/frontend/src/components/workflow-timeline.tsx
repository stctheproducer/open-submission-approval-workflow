import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  formatDate,
  formatTimelineLabel,
  type WorkflowTransition,
} from "@/lib/review-workflow"
import { cn } from "@/lib/utils"

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
          history?.map((entry, index) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              showSeparator={index < history.length - 1}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}

function TimelineEntry({
  entry,
  showSeparator,
}: {
  entry: WorkflowTransition
  showSeparator: boolean
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-[1.5rem] border border-border bg-background/70 py-5">
        <CardHeader>
          <h4 className="text-base font-semibold tracking-tight text-foreground">
            {formatTimelineLabel(entry)}
          </h4>
          <CardDescription>{formatDate(entry.createdAt)}</CardDescription>
        </CardHeader>
        {entry.comment ? (
          <CardContent>
            {entry.actor?.fullName ? (
              <p className="mb-3 text-sm text-muted-foreground">
                {entry.actor.fullName}
              </p>
            ) : null}
            <p className="text-sm leading-6 text-foreground">{entry.comment}</p>
          </CardContent>
        ) : entry.actor?.fullName ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {entry.actor.fullName}
            </p>
          </CardContent>
        ) : null}
      </Card>
      {showSeparator ? <Separator className={cn("bg-border/70")} /> : null}
    </div>
  )
}
