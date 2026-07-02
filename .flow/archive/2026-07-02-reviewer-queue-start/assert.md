# Reviewer Queue Start — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/reviewer-queue-start/blueprint.md
> Date: 2026-07-02

## Summary

This plan covers the reviewer-facing entry point for the application workflow: the queue list with optional review-state filtering, the application detail view scoped to the reviewer workspace, and the explicit start-review transition that claims an application for the current reviewer. It asserts reviewer-role gating, queue scoping, pagination, the atomic status transition with audit-log write, and the conflict rejection for ineligible applications.

## Pre-implementation requirements

- **`UserFactory`** — required for authenticating test requests via `loginAs()` and seeding applicant vs reviewer role variants. File: `apps/backend/database/factories/user_factory.ts`.
- **`ApplicationFactory`** — required for seeding applications across queue, detail, and start-review tests with various statuses and assignment states. File: `apps/backend/database/factories/application_factory.ts`.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Unauthenticated GET reviewer applications index → 401 | add | — |
| Non-reviewer (applicant role) GET reviewer applications index → 403 | add | — |
| Reviewer lists combined queue (default), paginated, most-recent-first, wrapped `{ data, meta }` | add | — |
| Reviewer filters queue by `reviewState=ready`, returns only ready applications | add | — |
| Reviewer filters queue by `reviewState=owned`, returns only owned applications | add | — |
| Invalid `reviewState` filter value → 422 | add | — |
| Unauthenticated GET reviewer applications show → 401 | skip | Auth middleware is group-level; index 401 test proves it is wired |
| Non-reviewer (applicant role) GET reviewer applications show → 403 | add | — |
| Reviewer views application detail, returns `forReviewerDetail` variant with applicant and assignedReviewer | add | — |
| Reviewer views inaccessible application (not in reviewer queue scope) → 404 | add | — |
| Unauthenticated POST review-starts → 401 | skip | Auth middleware is group-level; index 401 test proves it is wired |
| Non-reviewer (applicant role) POST review-starts → 403 | add | — |
| Reviewer starts review on eligible submitted application → 200, status `UNDER_REVIEW`, reviewer assigned, audit log row written | add | — |
| Reviewer starts review on ineligible application → 409 conflict, application unchanged, no new audit log row | add | — |
| Reviewer starts review on non-existent application → 404 | add | — |
| Unit test for `ApplicationReviewStartService` eligibility branching | skip | Functional tests for eligible and ineligible paths exercise the same branching through the real HTTP cycle; no bug slips through that the functional layer cannot catch |
| Frontend workspace wiring | skip | Frontend; out of scope for API test plan |

## Test list (ordered)

Reads: testing.md

1. T1 [functional] — rejects unauthenticated requests to the reviewer queue (401)
2. T2 [functional] — rejects non-reviewer users from the reviewer queue (403)
3. T3 [functional] — lists the combined reviewer queue paginated with most-recent-first ordering (200)
4. T4 [functional] — filters the reviewer queue by reviewState parameter (200)
5. T5 [functional] — rejects an invalid reviewState filter value (422)
6. T6 [functional] — shows an application detail with the reviewer-detail variant (200)
7. T7 [functional] — rejects non-reviewer users from viewing an application (403)
8. T8 [functional] — returns 404 for an inaccessible application (404)
9. T9 [functional] — rejects non-reviewer users from starting review (403)
10. T10 [functional] — starts review on an eligible submitted application and returns the updated detail (200)
11. T11 [functional] — rejects starting review on an ineligible application with a conflict error (409)
12. T12 [functional] — returns 404 when starting review on a non-existent application

## Per-test contracts

Reads: testing.md

### Test 1 — rejects unauthenticated requests to the reviewer queue (401)

- **Surface:** `ReviewerApplicationsController.index`
- **Suite:** functional
- **Setup:**
  - Factories: none
  - Fakes: none
  - Auth: none (no `loginAs`)
  - Other: none
- **Action:** GET to `reviewer.applications.index`
- **Outcome contract:**
  - Status: 401
- **Does NOT assert:** response body shape (framework auth denial)
- **Why:** Proves the session guard blocks unauthenticated access to the reviewer workspace entry point.

### Test 2 — rejects non-reviewer users from the reviewer queue (403)

- **Surface:** `ReviewerApplicationsController.index`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant role)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** GET to `reviewer.applications.index`
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details-style error envelope
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the reviewer-workspace ability gates the queue to reviewer-role users only.

### Test 3 — lists the combined reviewer queue paginated with most-recent-first ordering (200)

- **Surface:** `ReviewerApplicationsController.index`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (reviewer), `UserFactory` (applicant, for ownership), `ApplicationFactory` (3 SUBMITTED rows with no assigned reviewer), `ApplicationFactory` (2 UNDER_REVIEW rows assigned to the reviewer)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** GET to `reviewer.applications.index` with no query parameters
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: [...], meta: {...} }` per paginated wrapping; `data` has length 5; contains both SUBMITTED (ready) and UNDER_REVIEW (owned) applications; ordered by most recent workflow activity first; each item includes `id`, `title`, `category`, `status`, `applicant` (UserTransformer output), `assignedReviewer` (UserTransformer output or `null`), `reviewState`, `createdAt`, `updatedAt`; `meta` contains pagination fields
- **Does NOT assert:** specific pagination cursor values; exact meta field names beyond what the serializer produces
- **Why:** Proves the default combined queue returns both ready and owned work with correct pagination, ordering, and transformer shape.

### Test 4 — filters the reviewer queue by reviewState parameter (200)

- **Surface:** `ReviewerApplicationsController.index`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (reviewer), `UserFactory` (applicant, for ownership), `ApplicationFactory` (3 SUBMITTED rows with no assigned reviewer), `ApplicationFactory` (2 UNDER_REVIEW rows assigned to the reviewer)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: parameterized via `.with([...]).run(...)` across two rows: (a) `{ reviewState: 'ready', expectedCount: 3 }`, (b) `{ reviewState: 'owned', expectedCount: 2 }`
- **Action:** GET to `reviewer.applications.index` with query parameter `reviewState` set to the parameterized value
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: [...], meta: {...} }` per paginated wrapping; `data` has length matching `expectedCount`; every item's `reviewState` matches the filter value; `meta` contains pagination fields
- **Does NOT assert:** specific pagination cursor values; exact meta field names beyond what the serializer produces
- **Why:** Proves the queue filter correctly narrows to ready or owned work based on the `reviewState` parameter.

### Test 5 — rejects an invalid reviewState filter value (422)

- **Surface:** `ReviewerApplicationsController.index`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (reviewer)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** GET to `reviewer.applications.index` with query parameter `reviewState=invalid`
- **Outcome contract:**
  - Status: 422
  - Body: `{ errors: [{ field, message, rule }] }` per validation error wrapping; at least one error entry present
- **Does NOT assert:** specific error message text
- **Why:** Proves the controller whitelist rejects invalid `reviewState` values before any query executes.

### Test 6 — shows an application detail with the reviewer-detail variant (200)

- **Surface:** `ReviewerApplicationsController.show`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (reviewer), `UserFactory` (applicant), `ApplicationFactory` (one UNDER_REVIEW application assigned to the reviewer, with applicant relation)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** GET to `reviewer.applications.show` with `{ id: application.id }`
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: { id, title, category, status, description, amount, createdAt, updatedAt, applicant, assignedReviewer, reviewState } }` per ApplicationTransformer `forReviewerDetail` variant; `data.id` equals the requested application's id; `data.description` and `data.amount` are present (detail-variant fields); `data.applicant` is a UserTransformer output; `data.assignedReviewer` is a UserTransformer output matching the reviewer
- **Does NOT assert:** that the model instance was loaded via a specific query strategy; specific timestamp values
- **Why:** Proves the detail endpoint returns the full reviewer-detail transformer variant with preloaded relations.

### Test 7 — rejects non-reviewer users from viewing an application (403)

- **Surface:** `ReviewerApplicationsController.show`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant role), `UserFactory` (other applicant, for ownership), `ApplicationFactory` (one application owned by the other applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** GET to `reviewer.applications.show` with `{ id: application.id }`
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details-style error envelope
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the reviewer-workspace ability gates the detail route to reviewer-role users only.

### Test 8 — returns 404 for an inaccessible application (404)

- **Surface:** `ReviewerApplicationsController.show`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (reviewer), `UserFactory` (applicant, for ownership), `ApplicationFactory` (one DRAFT application owned by the applicant — not in the reviewer queue scope)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** GET to `reviewer.applications.show` with `{ id: application.id }`
- **Outcome contract:**
  - Status: 404
  - Body: Problem Details-style error envelope
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the queue scope hides applications outside the reviewer workspace (e.g., drafts) behind a 404 rather than leaking their existence.

### Test 9 — rejects non-reviewer users from starting review (403)

- **Surface:** `ApplicationReviewStartsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant role), `ApplicationFactory` (one SUBMITTED application)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** POST to the review-starts route with `{ id: application.id }`
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details-style error envelope
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the reviewer-workspace ability gates the start-review transition to reviewer-role users only.

### Test 10 — starts review on an eligible submitted application and returns the updated detail (200)

- **Surface:** `ApplicationReviewStartsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (reviewer), `UserFactory` (applicant, for ownership), `ApplicationFactory` (one SUBMITTED application owned by the applicant, no assigned reviewer)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** POST to the review-starts route with `{ id: application.id }`
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: { id, title, category, status: 'UNDER_REVIEW', description, amount, createdAt, updatedAt, applicant, assignedReviewer, reviewState } }` per ApplicationTransformer `forReviewerDetail` variant; `data.status` equals `'UNDER_REVIEW'`; `data.assignedReviewer` is a UserTransformer output matching the current reviewer
  - DB: `db.assertHas('applications', { id: application.id, status: 'UNDER_REVIEW', assigned_reviewer_id: reviewer.id })`; `db.assertHas('application_audit_logs', { application_id: application.id, actor_user_id: reviewer.id, from_status: 'SUBMITTED', to_status: 'UNDER_REVIEW' })`
- **Does NOT assert:** specific timestamp values; that no other side effects occurred
- **Why:** Proves the happy-path start-review transition — the application moves to UNDER_REVIEW, the reviewer is assigned, and the audit log records the transition atomically.

### Test 11 — rejects starting review on an ineligible application with a conflict error (409)

- **Surface:** `ApplicationReviewStartsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (reviewer), `UserFactory` (other reviewer), `UserFactory` (applicant, for ownership), `ApplicationFactory` (one UNDER_REVIEW application already assigned to the other reviewer)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** POST to the review-starts route with `{ id: application.id }`
- **Outcome contract:**
  - Status: 409
  - Body: Problem Details-style error envelope per `ApplicationTransitionConflictException`
  - DB: `db.assertHas('applications', { id: application.id, status: 'UNDER_REVIEW', assigned_reviewer_id: otherReviewer.id })` — row remains unchanged; no new audit log row written for this application
- **Does NOT assert:** specific Problem Details `type` or `detail` strings; specific timestamp values
- **Why:** Proves the workflow rule that locks start-review once the application is no longer eligible — the transition is rejected and the application remains unchanged.

### Test 12 — returns 404 when starting review on a non-existent application

- **Surface:** `ApplicationReviewStartsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (reviewer)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** POST to the review-starts route with `{ id: 999999 }`
- **Outcome contract:**
  - Status: 404
  - Body: Problem Details-style error envelope
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the service's `findOrFail` returns a 404 for non-existent applications rather than a conflict error.

## Factories audit

Reads: testing.md

| Factory | Existing / New | Used by |
| ------- | -------------- | ------- |
| `UserFactory` | new | T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12 |
| `ApplicationFactory` | new | T6, T7, T8, T9, T10, T11 |

## Fakes audit

Reads: testing.md

No fakes or container swaps required. This slice has no external IO boundaries — `ApplicationReviewStartService` operates on the database only, which is exercised through the real DB in functional tests.

## Order rationale

The two read surfaces come first (index before show is natural), then the write surface. All are independent and use factories for test data, so no hard dependencies force this sequence.

## Runner-model risks

Reads: testing.md

None identified. Every test creates its own factories, DB truncation via `group.each.setup` ensures state isolation, no container swaps or fakes are used, parameterized tests use `.with().run()`, and all assertions follow status-before-body order with transformer-shaped bodies.
