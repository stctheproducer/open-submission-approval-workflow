---
affects: [application-drafts]
briefed: 2026-07-03
---

# Application Draft Reopening — Brief

## Entry point, user goal, status

An authenticated applicant opens an application that is waiting on requested changes and wants to explicitly reopen that same record back to draft before editing resumes. This is a new applicant recovery journey.

## Prerequisites

- Applicant-owned application read history.
- Reviewer change-request workflow that can place an application into requested changes.

## The journey, step by step

1. The applicant opens an owned application that is in requested changes and first sees that record in a read-only state.
2. The applicant reviews the current status and the existing history already visible on that application.
3. The applicant chooses the explicit reopen action for that same application record.
4. On success, the application returns to draft so editing can resume on the same record.
5. When the application is not in requested changes, the reopen action is not accepted and the application stays in its current state.
6. When the applicant does not own the application, the record stays private and the reopen action is not available to them.

## Decisions made

| Decision | Options considered | Chosen | Why |
| --- | --- | --- | --- |
| Recovery pattern | Edit immediately vs explicit reopen step first | Explicit reopen step first | Applicants should deliberately re-enter draft after reviewing the current requested-changes record. |
| Record continuity | Reopen same record vs create a new record for revisions | Reopen same record | The revision round should continue on the existing application. |
| Reviewer feedback access | Separate special response vs existing history/detail behavior | Existing history/detail behavior | The current read journey already carries the needed reviewer feedback context. |

## Constraints the journey places on implementation

- Requested-changes applications must be readable before the applicant reopens them.
- Reopening must act on the same application record.
- Reopening must return the application to draft before editing resumes.
- The journey must reject reopening attempts for applications that are not in requested changes.
- The journey must not reveal or reopen another applicant's application.
