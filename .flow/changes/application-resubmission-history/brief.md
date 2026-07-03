---
affects: [application-submission]
briefed: 2026-07-03
---

# Application Resubmission History — Brief

## Entry point, user goal, status

An authenticated applicant has reopened an application after requested changes and wants to resubmit that same record while keeping the revision-round history understandable. This is an extension of the submission journey.

## Prerequisites

- Applicant-owned application read history.
- Application draft reopening.
- Applicant draft editing.

## The journey, step by step

1. The applicant reopens an owned requested-changes application back to draft.
2. The applicant revises that same application record.
3. The applicant submits the reopened draft again.
4. On success, the same application record re-enters the reviewer workflow.
5. The application history records this as a distinct revision-round submission event rather than collapsing it into the first submission.
6. When the reopened draft cannot be submitted, the application stays in draft and no new revision-round submission event is added to history.

## Decisions made

| Decision | Options considered | Chosen | Why |
| --- | --- | --- | --- |
| Revision submission history | Reuse normal submission history semantics vs distinct revision-round semantics | Distinct revision-round semantics | The applicant and reviewer need to understand that the record was resubmitted after requested changes. |
| Record continuity | Resubmit same record vs create a new record | Resubmit same record | The recovery flow is about continuing the original application. |

## Constraints the journey places on implementation

- Resubmission in this slice must act on the same reopened application record.
- A successful resubmission must create a distinct visible history event for the revision round.
- Failed resubmission attempts must not create a new revision-round history event.
