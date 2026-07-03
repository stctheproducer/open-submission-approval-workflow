---
capability: reviewer-queue-start
change: reviewer-queue-start
synced: 2026-07-03
---

# Delta — reviewer-queue-start

## ADDED

### Reviewers see a single queue of actionable work

- Given a signed-in reviewer is in their workspace, when they open the queue, then they see applications waiting for review and any in-review applications they already own.
- Given an application is not actionable for that reviewer, when they open the queue, then it does not appear as part of their actionable work.

### Reviewers can start work on an eligible application

- Given a reviewer sees an eligible application in the queue, when they start review, then the application becomes owned by that reviewer and moves into in review.
- Given the application is no longer eligible, already owned by someone else, or the reviewer is not allowed to act, when they try to start review, then the product rejects the attempt and the application stays unchanged.

## MODIFIED

_None._

## REMOVED

_None._
