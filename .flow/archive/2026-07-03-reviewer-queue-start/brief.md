---
affects: [reviewer-queue-start]
briefed: 2026-07-03
---

# Reviewer Queue Start — Brief

## Entry point, user goal, status

A signed-in reviewer enters the reviewer workspace and wants to see the work they can take next. This is a new reviewer workflow slice covering the queue and the start-review action.

## Prerequisites

The reviewer has already signed in and reached the reviewer area.

## The journey, step by step

1. The reviewer arrives in the workspace and sees a queue of actionable applications.
2. The queue includes applications waiting for a reviewer and applications already started by that reviewer so they can return to work they own.
3. The reviewer chooses an eligible application and starts review.
4. Starting review makes that application clearly owned by the current reviewer and moves it into the in-review state.
5. If the application is no longer eligible, already owned by someone else, or the reviewer is not allowed to act on it, the product rejects the attempt and leaves the queue unchanged.

## Decisions made

| Alternative | Decision | Reason |
| --- | --- | --- |
| Queue only waiting applications vs waiting plus already-started applications | Waiting plus already-started applications chosen | Reviewers need one place to resume work they already own. |
| Separate claim step vs start review as the ownership moment | Start review chosen | Ownership should be created when the reviewer actually begins work. |
| Broad task list vs queue limited to reviewable work | Queue limited to reviewable work chosen | The workspace stays focused when it only surfaces actionable items. |

## Constraints the journey places on implementation

- The reviewer sees a single queue of reviewable applications.
- The queue includes both waiting work and any in-review work already owned by the signed-in reviewer.
- Starting review is only possible when the application is eligible for that action.
- A successful start makes the current reviewer the owner of that application and changes its visible state to in review.
- Attempts that are no longer valid are rejected and do not alter the queue or ownership.
