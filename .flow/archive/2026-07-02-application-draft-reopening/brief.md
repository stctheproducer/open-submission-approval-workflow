---
affects: [application-draft-reopening]
briefed: 2026-07-02
---

# Application Draft Reopening — Brief

## Entry point, user goal, status

An applicant is looking at their own application after a change request and wants to take it back into draft so they can edit and resubmit it. This is a new workflow slice for returning the same application to the editable phase.

## Prerequisites

The application must belong to the applicant, and it must already have been returned for changes by a reviewer.

## The journey, step by step

The applicant opens the same application that was returned for changes.

The applicant chooses to take the application back into draft so they can edit it again.

The system accepts the reopening and the application becomes editable by the applicant once more.

If the applicant tries to reopen an application that has not been returned for changes, the system rejects the attempt and the application remains unchanged.

If the applicant tries to reopen someone else’s application, the system rejects the attempt and the application remains private.

## Decisions made

| Alternative | Decision | Reasoning |
| --- | --- | --- |
| Reopen to a fresh application vs reopen the same application | Reopen the same application chosen | The change-request loop should preserve the application's history and identity across rounds. |
| Reopen after any reviewer decision vs only after a change request | Only after a change request chosen | Reopening is a revision step, not a response to terminal decisions. |

## Constraints the journey places on implementation

- The applicant can reopen only their own application.
- Reopening is allowed only after a change request has been made.
- Reopening returns the application to draft so the applicant can edit and resubmit it.
- Invalid reopening attempts leave the application unchanged.
