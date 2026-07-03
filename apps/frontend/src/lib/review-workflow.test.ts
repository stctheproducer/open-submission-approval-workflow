import { describe, expect, it } from "vitest"

import {
  canApprove,
  canStartReview,
  formatTimelineLabel,
  humanizeReviewState,
  humanizeStatus,
} from "@/lib/review-workflow"

describe("review workflow presentation", () => {
  it("humanizes workflow status and review state labels", () => {
    expect(humanizeStatus("under_review")).toBe("Under review")
    expect(humanizeReviewState("ready")).toBe("Ready")
    expect(humanizeReviewState("owned")).toBe("Owned by you")
  })

  it("formats workflow timeline labels", () => {
    expect(
      formatTimelineLabel({
        id: 1,
        previousStatus: "submitted",
        nextStatus: "under_review",
      }),
    ).toBe("Submitted -> Under review")
  })

  it("guards reviewer decision availability", () => {
    expect(canStartReview({ status: "submitted", reviewState: "ready" })).toBe(true)
    expect(canStartReview({ status: "approved", reviewState: "owned" })).toBe(false)
    expect(canApprove({ status: "under_review", reviewState: "owned" })).toBe(true)
    expect(canApprove({ status: "submitted", reviewState: "ready" })).toBe(false)
  })
})
