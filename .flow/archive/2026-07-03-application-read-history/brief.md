---
affects: [application-drafts, application-submission]
briefed: 2026-07-03
---

# Application Read History — Brief

## Entry point, user goal, status

An authenticated applicant enters from their application workspace and wants to review any application they own, understand its current status, and see the status-transition history for that same record. This is a new applicant read journey.

## Prerequisites

- Session authentication that recognizes the applicant.
- Applicant-owned application creation and submission flows that already produce owned application records.

## The journey, step by step

1. The applicant opens their application workspace and sees only applications they own across all applicant-visible statuses.
2. The workspace shows the current status for each owned application so the applicant can decide which record to open.
3. The applicant opens one owned application and sees that application's current status clearly on the detail view.
4. The detail view includes the application's status-transition history within the same journey so the applicant does not need a separate audit flow.
5. When the application has recorded status transitions, the applicant sees them in chronological history for that same record.
6. When the application has no recorded status transitions yet, the applicant still reaches the detail view and sees the current application state without invented history entries.
7. When the applicant tries to open an application they do not own, the record stays private and is not revealed.

## Decisions made

| Decision | Options considered | Chosen | Why |
| --- | --- | --- | --- |
| Detail coverage | All applicant-owned statuses vs only submitted-and-later statuses | All applicant-owned statuses | Applicants need one consistent read journey for every record they own. |
| Timeline scope | Status transitions only vs status transitions plus draft creation | Status transitions only | The timeline is meant to explain workflow movement, not draft editing activity. |
| History access | Embedded in the application detail vs separate audit journey | Embedded in the application detail | Applicants should understand status history without leaving the application record. |

## Constraints the journey places on implementation

- The applicant workspace must include only applications owned by the signed-in applicant.
- The workspace must support a paginated list with sensible default ordering.
- The detail journey must be available for every applicant-owned application status.
- The timeline must show only status transitions that belong to the application.
- The journey must not expose another applicant's application or transition history.
