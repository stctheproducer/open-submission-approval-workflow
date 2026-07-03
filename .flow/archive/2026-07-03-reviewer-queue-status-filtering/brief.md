---
affects: [reviewer-queue-status-filtering]
briefed: 2026-07-03
---

# Reviewer Queue Status Filtering — Brief

## Entry point, user goal, status

A reviewer is already in the queue and wants to narrow it to the applications in a specific workflow status. This is a new queue refinement slice that keeps the reviewer workspace focused.

## Prerequisites

The reviewer has already signed in and can see the reviewer queue.

## The journey, step by step

1. The reviewer opens the queue.
2. The reviewer chooses a workflow status to narrow the list.
3. The queue shows only applications in that status while keeping the queue’s normal ordering and paging behavior.
4. The reviewer can clear the status choice and return to the full queue.
5. If the reviewer chooses a status that is not available, the product rejects the choice and keeps the current queue view.

## Decisions made

| Alternative | Decision | Reason |
| --- | --- | --- |
| Single status at a time vs multiple statuses at once | Single status at a time chosen | It keeps the queue easy to read and the reviewer’s intent obvious. |
| Status-only filtering vs adding search or richer queue tools | Status-only filtering chosen | The change stays small and directly useful without turning into queue tooling creep. |
| Free-form status entry vs fixed known statuses | Fixed known statuses chosen | Reviewers should only be able to choose states the workflow actually uses. |

## Constraints the journey places on implementation

- The reviewer can narrow the queue by one workflow status at a time.
- The filtered queue still behaves like the same paginated queue the reviewer already knows.
- Clearing the status choice returns the reviewer to the full queue.
- Unavailable status choices are rejected and do not change the current queue view.
