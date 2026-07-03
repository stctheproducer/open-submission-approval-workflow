---
capability: reviewer-queue-start
change: resubmitted-reviewer-queue
synced: 2026-07-03
---

# Delta — reviewer-queue-start

## ADDED

### Resubmitted applications appear as ready reviewer work

- Given an application was returned for changes, reopened by its owner, and successfully submitted again, when a reviewer opens the queue, then that application appears as ready work eligible for review start.
- Given a resubmitted application is visible as ready work, when an eligible reviewer starts review on it, then the application becomes owned by that reviewer and moves into in-review work for the new cycle.

## MODIFIED

### Reviewers see a single queue of actionable work

_Was: the queue showed submitted applications without an owner and in-review applications owned by the current reviewer._

- Given a signed-in reviewer is in their workspace, when they open the queue, then they see applications waiting for review and any in-review applications they already own.
- Given an application was successfully resubmitted after requested changes, when the reviewer opens the queue, then it appears among the applications waiting for review.
- Given an application is not actionable for that reviewer, when they open the queue, then it does not appear as part of their actionable work.

## REMOVED

_None._
