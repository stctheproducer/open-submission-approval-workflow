---
capability: application-submission
change: application-read-history
synced: 2026-07-03
---

# Delta — application-submission

## ADDED

_None._

## MODIFIED

### Submission appears in the application history

_Was: A successful submission appeared as the first visible history entry on the applicant detail page, and failed submissions added no history entry._

- Given a successfully submitted application, when the applicant opens the application detail page, then the submission is shown within the application's visible status-transition history.
- Given an application with multiple workflow transitions, when the applicant opens the application detail page, then they can review the application's status-transition history for that same record in chronological order.
- Given a failed submission attempt, when the applicant checks the application afterward, then the application history does not show a new submission entry.

## REMOVED

_None._
