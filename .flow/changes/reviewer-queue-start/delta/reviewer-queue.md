---
capability: reviewer-queue
change: reviewer-queue-start
---

# Delta — reviewer-queue

## ADDED

### Reviewer queue, detail access, and start review

- Given an authenticated reviewer, when they open their review workspace, then they see a queue of work that is ready for review and work already assigned to them.
- Given an authenticated reviewer viewing their queue, when they filter by review state, then they can focus on either unclaimed work or work they already own.
- Given an authenticated reviewer viewing an application in the queue, when they open it, then they can inspect its details before deciding whether to begin review.
- Given an authenticated reviewer viewing an eligible application, when they start review, then the application moves into owned review and becomes associated with that reviewer.
- Given an authenticated reviewer attempting to start review on an ineligible application, when they submit the action, then the system rejects it and leaves the application unchanged.

## MODIFIED

_None._

## REMOVED

_None._
