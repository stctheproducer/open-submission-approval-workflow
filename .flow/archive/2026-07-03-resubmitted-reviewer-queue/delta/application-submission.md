---
capability: application-submission
change: resubmitted-reviewer-queue
synced: 2026-07-03
---

# Delta — application-submission

## ADDED

_None._

## MODIFIED

### Reopened applications create distinct resubmission history

_Was: a successful resubmission re-entered the reviewer workflow and recorded a distinct revision-round submission event in history._

- Given an authenticated applicant who owns an application reopened from requested changes, when they submit that same record again, then the application re-enters the reviewer workflow, becomes visible to reviewers as ready work, and its history records a distinct revision-round submission event.
- Given a reopened application that fails to submit again, when the applicant checks the application afterward, then no new revision-round submission event appears in history and the application does not enter reviewer ready work.

## REMOVED

_None._
