# Reviewer Queue Start — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/reviewer-queue-start/blueprint.md
> Date: 2026-07-03

## Summary

This plan covers the reviewer queue entry point and the start-review action. It locks the queue authentication, queue shape, and ownership-transition behavior that the backend already exposes.

## Pre-implementation requirements

_None._

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| ------------------- | -------- | ----- |
| Unauthenticated requests to the reviewer queue return 401 | keep | tests/functional/applications/reviewer.spec.ts:rejects unauthenticated requests to the reviewer queue (401) |
| Non-reviewer users are forbidden from the reviewer queue | keep | tests/functional/applications/reviewer.spec.ts:rejects non-reviewer users from the reviewer queue (403) |
| The reviewer queue returns the paginated combined queue | keep | tests/functional/applications/reviewer.spec.ts:lists the combined reviewer queue paginated with most-recent-first ordering (200) |
| Starting review on an eligible submitted application returns the owned detail payload | keep | tests/functional/applications/reviewer.spec.ts:starts review on an eligible submitted application and returns the updated detail (200) |
| Starting review on an ineligible application returns a conflict | keep | tests/functional/applications/reviewer.spec.ts:rejects starting review on an ineligible application with a conflict error (409) |
| Starting review on a missing application returns 404 | keep | tests/functional/applications/reviewer.spec.ts:returns 404 when starting review on a non-existent application |

## Test list (ordered)

Reads: testing.md

1. `T1 [functional]` - rejects unauthenticated requests to the reviewer queue (401)
2. `T2 [functional]` - rejects non-reviewer users from the reviewer queue (403)
3. `T3 [functional]` - lists the combined reviewer queue paginated with most-recent-first ordering (200)
4. `T4 [functional]` - starts review on an eligible submitted application and returns the updated detail (200)
5. `T5 [functional]` - rejects starting review on an ineligible application with a conflict error (409)
6. `T6 [functional]` - returns 404 when starting review on a non-existent application

## Per-test contracts

Reads: testing.md

### Test 1 — rejects unauthenticated requests to the reviewer queue (401)

- **Surface:** `ReviewerApplicationsController.index`
- **Suite:** functional
- **Setup:**
  - Factories: none
  - Fakes: none
  - Auth: none
  - Other: none
- **Action:** `GET reviewer.applications.index`
- **Outcome contract:**
  - Status: 401
  - Body: Problem Details error envelope for unauthorized access
  - DB / fake / exception assertions: `assertProblemDetails(response.body(), 401)`
- **Does NOT assert:** queue contents, pagination metadata, or any application row state
- **Why:** the queue entry point is reviewer-only and must reject anonymous access before any data is loaded

### Test 2 — rejects non-reviewer users from the reviewer queue (403)

- **Surface:** `ReviewerApplicationsController.index`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory`
  - Fakes: none
  - Auth: signed-in web user who is not a reviewer
  - Other: none
- **Action:** `GET reviewer.applications.index`
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details error envelope for forbidden access
  - DB / fake / exception assertions: `assertProblemDetails(response.body(), 403)`
- **Does NOT assert:** queue contents, pagination metadata, or any application row state
- **Why:** the reviewer queue must stay inaccessible to applicant users

### Test 3 — lists the combined reviewer queue paginated with most-recent-first ordering (200)

- **Surface:** `ReviewerApplicationsController.index`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory`, `ApplicationFactory`
  - Fakes: none
  - Auth: signed-in reviewer
  - Other: seed submitted and owned-under-review applications for the queue
- **Action:** `GET reviewer.applications.index`
- **Outcome contract:**
  - Status: 200
  - Body: paginated queue payload with `data` containing the seeded applications
  - DB / fake / exception assertions: `data.length === 4`; the returned ids include the seeded submitted and owned-under-review applications
- **Does NOT assert:** review-start behavior, detail payload shape, or any mutation of application rows
- **Why:** the reviewer landing surface must expose the actionable queue in the shape the frontend consumes

### Test 4 — starts review on an eligible submitted application and returns the updated detail (200)

- **Surface:** `ApplicationReviewStartsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory`, `ApplicationFactory`, `ApplicationStatusTransitionFactory`
  - Fakes: none
  - Auth: signed-in reviewer
  - Other: create a submitted application eligible for review
- **Action:** `POST reviewer.application_review_starts.store` for the target application id
- **Outcome contract:**
  - Status: 200
  - Body: detailed application payload with `status` set to `under_review`, `assignedReviewer.id` set to the current reviewer, `statusTransitions.length === 2`, and `history.length === 2`
  - DB / fake / exception assertions: the `applications` row is updated with `status = under_review` and `assigned_reviewer_id = reviewer.id`; an `application_audit_log_entries` row exists with the submitted -> under_review transition
- **Does NOT assert:** approval behavior, queue filtering, or any change-request/reject flow
- **Why:** starting review is the ownership transition and must atomically update both the application and the audit log

### Test 5 — rejects starting review on an ineligible application with a conflict error (409)

- **Surface:** `ApplicationReviewStartsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory`, `ApplicationFactory`
  - Fakes: none
  - Auth: signed-in reviewer
  - Other: create an application already assigned to another reviewer
- **Action:** `POST reviewer.application_review_starts.store` for the target application id
- **Outcome contract:**
  - Status: 409
  - Body: Problem Details error envelope for the conflict
  - DB / fake / exception assertions: `assertProblemDetails(response.body(), 409)`; the application row remains assigned to the original reviewer
- **Does NOT assert:** queue contents, detail payload shape, or any audit-log write
- **Why:** the ownership transition must fail cleanly when the application is no longer eligible

### Test 6 — returns 404 when starting review on a non-existent application

- **Surface:** `ApplicationReviewStartsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: none
  - Fakes: none
  - Auth: signed-in reviewer
  - Other: use a missing application id
- **Action:** `POST reviewer.application_review_starts.store` for the missing id
- **Outcome contract:**
  - Status: 404
  - Body: Problem Details error envelope for not found
  - DB / fake / exception assertions: `assertProblemDetails(response.body(), 404)`
- **Does NOT assert:** queue contents, row state, or any transition log
- **Why:** the review-start action must return a not-found response for an unknown target

## Factories audit

Reads: testing.md

| Test | Factory | Existing / New |
| ---- | ------- | -------------- |
| T1 | none | Existing |
| T2 | UserFactory | Existing |
| T3 | UserFactory, ApplicationFactory | Existing |
| T4 | UserFactory, ApplicationFactory, ApplicationStatusTransitionFactory | Existing |
| T5 | UserFactory, ApplicationFactory | Existing |
| T6 | none | Existing |

## Fakes audit

Reads: testing.md

| Test | Fake / swap | Binding + file |
| ---- | ----------- | -------------- |
| T1 | none | n/a |
| T2 | none | n/a |
| T3 | none | n/a |
| T4 | none | n/a |
| T5 | none | n/a |
| T6 | none | n/a |

## Order rationale

The queue auth checks come first because they fail before any queue data is loaded. The happy-path start-review test comes before the conflict and not-found cases so the plan mirrors the main reviewer flow before the rejection branches.

## Runner-model risks

Reads: testing.md

None identified.

## Open questions

None.
