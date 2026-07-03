import { Badge } from "@/components/ui/badge"
import {
  getReviewStateTone,
  getStatusTone,
  humanizeReviewState,
  humanizeStatus,
} from "@/lib/review-workflow"
import { cn } from "@/lib/utils"

export function ApplicationStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={cn(
        "rounded-full border px-3 py-1 text-[0.625rem] font-semibold tracking-[0.22em]",
        getStatusTone(status)
      )}
    >
      {humanizeStatus(status)}
    </Badge>
  )
}

export function ReviewStateBadge({
  reviewState,
}: {
  reviewState?: string | null
}) {
  return (
    <Badge
      className={cn(
        "rounded-full border px-3 py-1 text-[0.625rem] font-semibold tracking-[0.22em]",
        getReviewStateTone(reviewState)
      )}
    >
      {humanizeReviewState(reviewState)}
    </Badge>
  )
}
