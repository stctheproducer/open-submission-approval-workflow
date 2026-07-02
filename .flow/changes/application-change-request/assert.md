# Application Change Request — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/application-change-request/blueprint.md
> Date: 2026-07-02

## Summary

This plan covers the reviewer change-request transition for `Application` records: an authenticated, assigned reviewer can request changes on an under-review application with a required non-blank comment, the transition is written as an auditable status change, and the response returns the updated application summary. It asserts authentication gating, reviewer-role and assignment authorization, comment validation, the atomic status transition with audit entry, and conflict rejection for ineligible applications.

## Pre-implementation requirements

- **`UserFactory`** — required for authenticating test requests via `loginAs()` and seeding applicant vs reviewer role variants. File: `apps/backend/database/factories/user_factory.ts`.
- **`ApplicationFactory`** — required for seeding applications in various workflow states and assignment configurations. File: `apps/backend/database/factories/application_factory.ts`.
- **`ApplicationAuditEntryFactory`** — required for seeding prior transition history so the change-request response includes a realistic audit trail. File: `apps/backend/database/factories/application_audit_entry_factory.ts`.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Unauthenticated POST change-request → 401 | add | — |
| Non-reviewer (applicant role) POST change-request → 403 | add | — |
| Unassigned reviewer POST change-request → 403 | add | — |
| Missing comment → 422 with field-level validation errors, no audit entry written | add | — |
| Blank/whitespace-only comment → 422 with field-level validation errors, no audit entry written | add | — |
| Comment exceeding 2000 characters → 422 with field-level validation errors, no audit entry written | add | — |
| Assigned reviewer requests change on eligible under-review application with valid comment → 200, status `CHANGES_REQUESTED`, audit entry with comment written, visible history includes change-request entry | add | — |
| Non-eligible application (not under review) → 409 conflict, application unchanged, no new audit entry | add | — |
| Non-existent application → 404 | add | — |
| Applicant can see the returned state on the same application record | skip | No applicant-facing show endpoint in this slice; visibility is out of scope |
| Frontend changes | skip | Out of scope for this slice |

## Test list (ordered)

Reads: testing.md

1. T1 [functional] — rejects unauthenticated requests to request changes (401)
2. T2 [functional] — rejects non-reviewer users from requesting changes (403)
3. T3 [functional] — rejects an unassigned reviewer from requesting changes (403)
4. T4 [functional] — rejects invalid comment payloads with field-level validation errors (422)
5. T5 [functional] — requests change on an eligible under-review application and returns the updated summary (200)
6. T6 [functional] — rejects a change request on a non-eligible application with a conflict error (409)
7. T7 [functional] — returns 404 for a non-existent application

## Per-test contracts

Reads: testing.md

### Test 1 — rejects unauthenticated requests to request changes (401)

- **Surface:** `ApplicationChangeRequestsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `ApplicationFactory` (one record, any state)
  - Fakes: none
  - Auth: none (no `loginAs`)
  - Other: none
- **Action:** POST to `reviewer.applications.change-request` with `{ id: application.id }` and body `{ comment: 'Please update the budget section' }`
- **Outcome contract:**
  - Status: 401
- **Does NOT assert:** response body shape (framework auth denial)
- **Why:** Proves the session guard blocks unauthenticated access to the change-request transition.

### Test 2 — rejects non-reviewer users from requesting changes (403)

- **Surface:** `ApplicationChangeRequestsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant role), `UserFactory` (other applicant), `ApplicationFactory` (one UNDER_REVIEW application owned by the other applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** POST to `reviewer.applications.change-request` with `{ id: application.id }` and body `{ comment: 'Please update the budget section' }`
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details-style error envelope
  - DB: `db.assertHas('applications', { id: application.id, status: 'UNDER_REVIEW' })` — row remains unchanged
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the reviewer-workspace ability gates the change-request action to reviewer-role users only, and that no state changes occur on denial.

### Test 3 — rejects an unassigned reviewer from requesting changes (403)

- **Surface:** `ApplicationChangeRequestsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (unassigned reviewer), `UserFactory` (assigned reviewer), `UserFactory` (applicant), `ApplicationFactory` (one UNDER_REVIEW application assigned to the assigned reviewer, not the unassigned one)
  - Fakes: none
  - Auth: `loginAs(unassignedReviewer)` via session guard
  - Other: none
- **Action:** POST to `reviewer.applications.change-request` with `{ id: application.id }` and body `{ comment: 'Please update the budget section' }`
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details-style error envelope
  - DB: `db.assertHas('applications', { id: application.id, status: 'UNDER_REVIEW', reviewer_id: assignedReviewer.id })` — row remains unchanged
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the policy enforces reviewer assignment — a reviewer who is not assigned to the application cannot request changes on it.

### Test 4 — rejects invalid comment payloads with field-level validation errors (422)

- **Surface:** `ApplicationChangeRequestsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (assigned reviewer), `UserFactory` (applicant), `ApplicationFactory` (one UNDER_REVIEW application assigned to the reviewer)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: parameterized via `.with([...]).run(...)` across three rows: (a) `{ body: {} }` (missing comment field), (b) `{ body: { comment: '   ' } }` (whitespace-only), (c) `{ body: { comment: 'x'.repeat(2001) } }` (exceeds maxLength)
- **Action:** POST to `reviewer.applications.change-request` with `{ id: application.id }` and the parameterized body
- **Outcome contract:**
  - Status: 422 for all three rows
  - Body: `{ errors: [{ field: 'comment', message, rule }] }` per validation error wrapping; at least one error entry present
  - DB: no audit entry written for this application
- **Does NOT assert:** specific error message text; that the application row is unchanged (validator runs before persistence)
- **Why:** Proves the validator rejects missing, blank, and over-length comments before any state change occurs.

### Test 5 — requests change on an eligible under-review application and returns the updated summary (200)

- **Surface:** `ApplicationChangeRequestsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (assigned reviewer), `UserFactory` (applicant), `ApplicationFactory` (one UNDER_REVIEW application assigned to the reviewer), `ApplicationAuditEntryFactory` (one prior transition: SUBMITTED → UNDER_REVIEW)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** POST to `reviewer.applications.change-request` with `{ id: application.id }` and body `{ comment: 'Please update the budget section' }`
- **Outcome contract:**
  - Status: 200
  - Body: `{ application: { id, status: 'CHANGES_REQUESTED', updatedAt } }` per unwrapped action payload; `application.id` equals the requested application's id; `application.status` equals `'CHANGES_REQUESTED'`
  - DB: `db.assertHas('applications', { id: application.id, status: 'CHANGES_REQUESTED' })`; `db.assertHas('application_audit_entries', { application_id: application.id, actor_id: reviewer.id, from_status: 'UNDER_REVIEW', to_status: 'CHANGES_REQUESTED', comment: 'Please update the budget section' })`
- **Does NOT assert:** specific timestamp values; that no other side effects occurred
- **Why:** Proves the happy-path change request — the application moves to CHANGES_REQUESTED, the audit entry records the transition with the required comment atomically, and the response returns the updated application summary.

### Test 6 — rejects a change request on a non-eligible application with a conflict error (409)

- **Surface:** `ApplicationChangeRequestsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (assigned reviewer), `UserFactory` (applicant), `ApplicationFactory` (one application with status `'APPROVED'` assigned to the reviewer — not eligible for change request)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** POST to `reviewer.applications.change-request` with `{ id: application.id }` and body `{ comment: 'Please update the budget section' }`
- **Outcome contract:**
  - Status: 409
  - Body: `{ errors: [{ message }] }` per `ApplicationTransitionConflictException`
  - DB: `db.assertHas('applications', { id: application.id, status: 'APPROVED' })` — row remains unchanged; no new audit entry written for this application
- **Does NOT assert:** specific error message text; specific timestamp values
- **Why:** Proves the workflow rule that locks change requests once the application is no longer under review — the transition is rejected and the application remains unchanged.

### Test 7 — returns 404 for a non-existent application

- **Surface:** `ApplicationChangeRequestsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (reviewer)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** POST to `reviewer.applications.change-request` with `{ id: 999999 }` and body `{ comment: 'Please update the budget section' }`
- **Outcome contract:**
  - Status: 404
  - Body: Problem Details-style error envelope
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the controller's `findOrFail` returns a 404 for non-existent applications rather than a conflict error.

## Factories audit

Reads: testing.md

| Factory | Existing / New | Used by |
| ------- | -------------- | ------- |
| `UserFactory` | new | T2, T3, T4, T5, T6, T7 |
| `ApplicationFactory` | new | T1, T2, T3, T4, T5, T6 |
| `ApplicationAuditEntryFactory` | new | T5 |

## Fakes audit

Reads: testing.md

No fakes or container swaps required. This slice has no external IO boundaries — `ApplicationWorkflowService` operates on the database only, which is exercised through the real DB in functional tests.

## Order rationale

Single surface; no ordering decisions required.

## Runner-model risks

Reads: testing.md

None identified. Every test creates its own factories, DB truncation via `group.each.setup` ensures state isolation, no container swaps or fakes are used, parameterized tests use `.with().run()`, and all assertions follow status-before-body order with transformer-shaped bodies.
