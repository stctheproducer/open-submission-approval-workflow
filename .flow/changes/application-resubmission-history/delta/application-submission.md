---
capability: application-submission
change: application-resubmission-history
---

# Delta — application-submission

## ADDED

### Reopened applications create distinct resubmission history

- Given an authenticated applicant who owns an application reopened from requested changes, when they submit that same record again, then the application re-enters the reviewer workflow and its history records a distinct revision-round submission event.
- Given a reopened application that fails to submit again, when the applicant checks the application afterward, then no new revision-round submission event appears in history.

## MODIFIED

_None._

## REMOVED

_None._
