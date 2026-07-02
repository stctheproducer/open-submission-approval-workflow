# Workflow Conflicts — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/workflow-conflicts/blueprint.md
> Date: 2026-07-02

## Summary

This plan covers the hardened workflow conflict behavior across all main application transition routes: stale transition attempts are rejected with a consistent 409 conflict response, the application remains unchanged, no audit entry is written, and the conflict envelope matches the same shape used by validation, authorization, and not-found failures. It asserts cross-route consistency and cross-error-type envelope uniformity.

## Pre-implementation requirements

- **`UserFactory`** — required for authenticating test requests via `loginAs()` and seeding applicant vs reviewer role variants. File: `apps/backend/database/factories/user_factory.ts`.
- **`ApplicationFactory`** — required for seeding applications in various workflow states to trigger stale transitions and other error types. File: `apps/backend/database/factories/application_factory.ts`.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Stale submission (application not in DRAFT) → 409 conflict, application unchanged, no audit entry | add | — |
| Stale review-start (application not in SUBMITTED) → 409 conflict, application unchanged, no audit entry | add | — |
| Stale approval (application not in UNDER_REVIEW) → 409 conflict, application unchanged, no audit entry | add | — |
| Stale rejection (application not in UNDER_REVIEW) → 409 conflict, application unchanged, no audit entry | add | — |
| Stale change-request (application not in UNDER_REVIEW) → 409 conflict, application unchanged, no audit entry | add | — |
| Stale draft-reopen (application not in CHANGES_REQUESTED) → 409 conflict, application unchanged, no audit entry | add | — |
| Conflict response envelope matches the same `{ errors: [{ message }] }` shape used by validation, authorization, and not-found failures | add | — |
| Valid transitions still succeed when application is in the expected state (control cases) | skip | Already covered by the per-slice assert plans; redundant |
| Retry of same invalid action produces the same conflict response | skip | Functionally identical to the stale-state tests; the service checks the same precondition each time |

## Test list (ordered)

Reads: testing.md

1. T1 [functional] — rejects stale workflow transitions with a consistent 409 conflict response across all main routes
2. T2 [functional] — conflict response envelope matches the same shape used by validation, authorization, and not-found failures

## Per-test contracts

Reads: testing.md

### Test 1 — rejects stale workflow transitions with a consistent 409 conflict response across all main routes

- **Surface:** Workflow conflict behavior (cross-surface)
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant and reviewer roles), `ApplicationFactory` (applications in wrong states for each route)
  - Fakes: none
  - Auth: `loginAs(applicant)` or `loginAs(reviewer)` per route
  - Other: parameterized via `.with([...]).run(...)` across six rows:
    - (a) submission route, applicant actor, application in SUBMITTED state
    - (b) review-start route, reviewer actor, application in UNDER_REVIEW state
    - (c) approval route, reviewer actor, application in APPROVED state
    - (d) rejection route, reviewer actor, application in REJECTED state
    - (e) change-request route, reviewer actor, application in CHANGES_REQUESTED state
    - (f) draft-reopen route, applicant actor, application in DRAFT state
- **Action:** POST to the parameterized route with the application id and any required body (e.g., comment for rejection/change-request)
- **Outcome contract:**
  - Status: 409 for all six rows
  - Body: `{ errors: [{ message }] }` per `ApplicationTransitionConflictException`
  - DB: `db.assertHas('applications', { id: application.id, status: <original wrong state> })` — row remains unchanged; no new audit entry written for this application
- **Does NOT assert:** specific error message text; specific timestamp values
- **Why:** Proves the workflow rule that locks transitions when the application is no longer in the expected state — the conflict response is consistent across all main routes.

### Test 2 — conflict response envelope matches the same shape used by validation, authorization, and not-found failures

- **Surface:** Workflow conflict behavior (cross-surface)
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant and reviewer roles), `ApplicationFactory` (applications in various states)
  - Fakes: none
  - Auth: `loginAs(applicant)` or `loginAs(reviewer)` per scenario
  - Other: four scenarios triggered in sequence within the test:
    - (a) 409: stale submission (application in SUBMITTED state)
    - (b) 422: missing comment on rejection (application in UNDER_REVIEW state, empty body)
    - (c) 403: non-reviewer attempting approval (applicant role, application in UNDER_REVIEW state)
    - (d) 404: non-existent application on submission (id: 999999)
- **Action:** POST to the appropriate route for each scenario
- **Outcome contract:**
  - Status: 409, 422, 403, and 404 respectively
  - Body: all four responses use the same top-level `errors` array shape; each response has at least one error entry with a `message` field
- **Does NOT assert:** specific error message text; that the error entries are identical across response types
- **Why:** Proves the API error contract is consistent across validation, authorization, not-found, and workflow-conflict failures so clients can handle them reliably.

## Factories audit

Reads: testing.md

| Factory | Existing / New | Used by |
| ------- | -------------- | ------- |
| `UserFactory` | new | T1, T2 |
| `ApplicationFactory` | new | T1, T2 |

## Fakes audit

Reads: testing.md

No fakes or container swaps required. This slice has no external IO boundaries — all transition services operate on the database only, which is exercised through the real DB in functional tests.

## Order rationale

T1 covers the main stale-state behavior across all routes; T2 asserts the envelope consistency across error types. Both are independent and use factories for test data, so no hard dependencies force this sequence.

## Runner-model risks

Reads: testing.md

None identified. Every test creates its own factories, DB truncation via `group.each.setup` ensures state isolation, no container swaps or fakes are used, parameterized tests use `.with().run()`, and all assertions follow status-before-body order with the standard errors envelope shape.
