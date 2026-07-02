# Application Rejection Comment — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/application-rejection-comment/blueprint.md
> Date: 2026-07-02

## Summary

This plan covers the reviewer rejection transition for `Application` records: an authenticated, assigned reviewer can reject an under-review application with a required non-empty comment, the rejection is written as an auditable status transition, and the response includes the rejected status with visible history. It asserts authentication gating, reviewer-role and assignment authorization, comment validation, the atomic status transition with audit-log write, and conflict rejection for ineligible applications.

## Pre-implementation requirements

- **`UserFactory`** — required for authenticating test requests via `loginAs()` and seeding applicant vs reviewer role variants. File: `apps/backend/database/factories/user_factory.ts`.
- **`ApplicationFactory`** — required for seeding applications in various workflow states and assignment configurations. File: `apps/backend/database/factories/application_factory.ts`.
- **`ApplicationAuditLogFactory`** — required for seeding prior transition history so the rejection response includes a realistic audit trail. File: `apps/backend/database/factories/application_audit_log_factory.ts`.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Unauthenticated POST rejections → 401 | add | — |
| Non-reviewer (applicant role) POST rejections → 403 | add | — |
| Unassigned reviewer POST rejections → 403 | add | — |
| Assigned reviewer rejects eligible under-review application with non-empty comment → 200, status `REJECTED`, audit log row with comment written, visible history includes rejection entry | add | — |
| Missing comment → 422 with field-level validation errors, no audit log row | add | — |
| Blank/whitespace-only comment → 422 with field-level validation errors, no audit log row | add | — |
| Non-eligible application (not under review) → 409 conflict, application unchanged, no new audit log row | add | — |
| Rejection comment and actor visible in application history | skip | Observed via the rejection response body itself; no separate show surface in this slice |
| Frontend changes | skip | Out of scope for this slice |

## Test list (ordered)

Reads: testing.md

1. T1 [functional] — rejects unauthenticated requests to reject an application (401)
2. T2 [functional] — rejects non-reviewer users from rejecting an application (403)
3. T3 [functional] — rejects an unassigned reviewer from rejecting an application (403)
4. T4 [functional] — rejects an eligible under-review application with a comment and returns the updated detail with history (200)
5. T5 [functional] — rejects a missing or blank comment with field-level validation errors (422)
6. T6 [functional] — rejects a non-eligible application with a conflict error (409)

## Per-test contracts

Reads: testing.md

### Test 1 — rejects unauthenticated requests to reject an application (401)

- **Surface:** `ApplicationRejectionsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `ApplicationFactory` (one record, any state)
  - Fakes: none
  - Auth: none (no `loginAs`)
  - Other: none
- **Action:** POST to `applications.rejections.store` with `{ application_id: application.id }` and body `{ comment: 'Does not meet requirements' }`
- **Outcome contract:**
  - Status: 401
- **Does NOT assert:** response body shape (framework auth denial)
- **Why:** Proves the session guard blocks unauthenticated access to the rejection transition.

### Test 2 — rejects non-reviewer users from rejecting an application (403)

- **Surface:** `ApplicationRejectionsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant role), `UserFactory` (other applicant), `ApplicationFactory` (one UNDER_REVIEW application owned by the other applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** POST to `applications.rejections.store` with `{ application_id: application.id }` and body `{ comment: 'Does not meet requirements' }`
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details-style error envelope
  - DB: `db.assertHas('applications', { id: application.id, status: 'UNDER_REVIEW' })` — row remains unchanged
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the reviewer-workspace ability gates the rejection action to reviewer-role users only, and that no state changes occur on denial.

### Test 3 — rejects an unassigned reviewer from rejecting an application (403)

- **Surface:** `ApplicationRejectionsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (unassigned reviewer), `UserFactory` (assigned reviewer), `UserFactory` (applicant), `ApplicationFactory` (one UNDER_REVIEW application assigned to the assigned reviewer, not the unassigned one)
  - Fakes: none
  - Auth: `loginAs(unassignedReviewer)` via session guard
  - Other: none
- **Action:** POST to `applications.rejections.store` with `{ application_id: application.id }` and body `{ comment: 'Does not meet requirements' }`
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details-style error envelope
  - DB: `db.assertHas('applications', { id: application.id, status: 'UNDER_REVIEW', reviewer_user_id: assignedReviewer.id })` — row remains unchanged
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the policy enforces reviewer assignment — a reviewer who is not assigned to the application cannot reject it.

### Test 4 — rejects an eligible under-review application with a comment and returns the updated detail with history (200)

- **Surface:** `ApplicationRejectionsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (assigned reviewer), `UserFactory` (applicant), `ApplicationFactory` (one UNDER_REVIEW application assigned to the reviewer), `ApplicationAuditLogFactory` (one prior transition: SUBMITTED → UNDER_REVIEW)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** POST to `applications.rejections.store` with `{ application_id: application.id }` and body `{ comment: 'Does not meet requirements' }`
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: { id, status: { raw, label: 'REJECTED' }, auditLogEntries: [...], createdAt, updatedAt } }` per ApplicationTransformer `forDetailedView` variant; `data.status.label` equals `'REJECTED'`; `data.auditLogEntries` contains the prior transition plus the new rejection entry with `fromStatus`, `toStatus`, `comment: 'Does not meet requirements'`, and `actor` matching the reviewer
  - DB: `db.assertHas('applications', { id: application.id, status: 'REJECTED' })`; `db.assertHas('application_audit_logs', { application_id: application.id, actor_user_id: reviewer.id, from_status: 'UNDER_REVIEW', to_status: 'REJECTED', comment: 'Does not meet requirements' })`
- **Does NOT assert:** specific timestamp values; that no other side effects occurred
- **Why:** Proves the happy-path rejection — the application moves to REJECTED, the audit log records the transition with the required comment atomically, and the response includes the full visible history with the rejection entry.

### Test 5 — rejects a missing or blank comment with field-level validation errors (422)

- **Surface:** `ApplicationRejectionsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (assigned reviewer), `UserFactory` (applicant), `ApplicationFactory` (one UNDER_REVIEW application assigned to the reviewer)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: parameterized via `.with([...]).run(...)` across two rows: (a) `{ body: {} }` (missing comment field), (b) `{ body: { comment: '   ' } }` (whitespace-only)
- **Action:** POST to `applications.rejections.store` with `{ application_id: application.id }` and the parameterized body
- **Outcome contract:**
  - Status: 422 for both rows
  - Body: `{ errors: [{ field: 'comment', message, rule }] }` per validation error wrapping; at least one error entry present
  - DB: no audit log row written for this application
- **Does NOT assert:** specific error message text; that the application row is unchanged (validator runs before persistence)
- **Why:** Proves the validator rejects missing or blank comments before any state change occurs.

### Test 6 — rejects a non-eligible application with a conflict error (409)

- **Surface:** `ApplicationRejectionsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (assigned reviewer), `UserFactory` (applicant), `ApplicationFactory` (one application with status `'APPROVED'` assigned to the reviewer — not eligible for rejection)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** POST to `applications.rejections.store` with `{ application_id: application.id }` and body `{ comment: 'Does not meet requirements' }`
- **Outcome contract:**
  - Status: 409
  - Body: Problem Details-style error envelope per `ApplicationTransitionConflictException`
  - DB: `db.assertHas('applications', { id: application.id, status: 'APPROVED' })` — row remains unchanged; no new audit log row written for this application
- **Does NOT assert:** specific Problem Details `type` or `detail` strings; specific timestamp values
- **Why:** Proves the workflow rule that locks rejection once the application is no longer under review — the transition is rejected and the application remains unchanged.

## Factories audit

Reads: testing.md

| Factory | Existing / New | Used by |
| ------- | -------------- | ------- |
| `UserFactory` | new | T2, T3, T4, T5, T6 |
| `ApplicationFactory` | new | T1, T2, T3, T4, T5, T6 |
| `ApplicationAuditLogFactory` | new | T4 |

## Fakes audit

Reads: testing.md

No fakes or container swaps required. This slice has no external IO boundaries — `ApplicationRejectionService` operates on the database only, which is exercised through the real DB in functional tests.

## Order rationale

Single surface; no ordering decisions required.

## Runner-model risks

Reads: testing.md

None identified. Every test creates its own factories, DB truncation via `group.each.setup` ensures state isolation, no container swaps or fakes are used, parameterized tests use `.with().run()`, and all assertions follow status-before-body order with transformer-shaped bodies.
