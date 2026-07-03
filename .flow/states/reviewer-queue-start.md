---
capability: reviewer-queue-start
---

# Reviewer Queue Start — State

## Requirements

### Reviewers see a single queue of actionable work

- Given a signed-in reviewer is in their workspace, when they open the queue, then they see applications waiting for review and any in-review applications they already own.
- Given an application was successfully resubmitted after requested changes, when the reviewer opens the queue, then it appears among the applications waiting for review.
- Given an application is not actionable for that reviewer, when they open the queue, then it does not appear as part of their actionable work.

### Reviewers can start work on an eligible application

- Given a reviewer sees an eligible application in the queue, when they start review, then the application becomes owned by that reviewer and moves into in review.
- Given the application is no longer eligible, already owned by someone else, or the reviewer is not allowed to act, when they try to start review, then the product rejects the attempt and the application stays unchanged.

### Resubmitted applications appear as ready reviewer work

- Given an application was returned for changes, reopened by its owner, and successfully submitted again, when a reviewer opens the queue, then that application appears as ready work eligible for review start.
- Given a resubmitted application is visible as ready work, when an eligible reviewer starts review on it, then the application becomes owned by that reviewer and moves into in-review work for the new cycle.
