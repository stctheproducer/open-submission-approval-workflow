# Application Draft Reopening — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/application-draft-reopening/blueprint.md
> Date: 2026-07-02

## Summary

This plan covers the applicant draft-reopen transition for `Application` records: an authenticated, owning applicant can reopen a changes-requested application back to draft, the transition is written as an auditable status change, and the response returns the updated application summary. It asserts authentication gating, applicant-ownership authorization, the atomic status transition with audit entry, and conflict rejection for ineligible applications.

## Pre-implementation requirements

- **`UserFactory`** — required for authenticating test requests via `loginAs()` and seeding applicant ownership variants. File: `apps/backend/database/factories/user_factory.ts`.
- **`ApplicationFactory`** — required for seeding applications in various workflow states and ownership configurations. File: `apps/backend/database/factories/application_factory.ts`.
- **`ApplicationAuditEntryFactory`** — required for seeding prior transition history so the reopen response includes a realistic audit trail. File: `apps/backend/database/factories/application_audit_entry_factory.ts`.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Unauthenticated POST reopen → 401 | add | — |
| Non-owner applicant POST reopen → 403 | add | — |
| Owning applicant reopens eligible changes-requested application → 200, status `DRAFT`, audit entry written | add | — |
| Non-eligible application (not changes-requested) → 409 conflict, application unchanged, no new audit entry | add | — |
| Non-existent application → 404 | add | — |
| Frontend changes | skip | Out of scope for this slice |

## Test list (ordered)

Reads: testing.md

1. T1 [functional] — reopens an eligible changes-requested application and returns the updated summary (200)
2. T2 [functional] — rejects unauthenticated requests to reopen an application (401)
3. T3 [functional] — rejects a non-owner applicant from reopening an application (403)
4. T4 [functional] — rejects reopening a non-eligible application with a conflict error (409)
5. T5 [functional] — returns 404 for a non-existent application

## Per-test contracts

Reads: testing.md

### Test 1 — reopens an eligible changes-requested application and returns the updated summary (200)

- **Surface:** `ApplicationDraftReopeningsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `ApplicationFactory` (one CHANGES_REQUESTED application owned by the applicant), `ApplicationAuditEntryFactory` (one prior transition: UNDER_REVIEW → CHANGES_REQUESTED)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** POST to `applicant.applications.reopen` with `{ id: application.id }`
- **Outcome contract:**
  - Status: 200
  - Body: `{ application: { id, status: 'DRAFT', updatedAt } }` per unwrapped action payload; `application.id` equals the requested application's id; `application.status` equals `'DRAFT'`
  - DB: `db.assertHas('applications', { id: application.id, status: 'DRAFT' })`; `db.assertHas('application_audit_entries', { application_id: application.id, actor_id: applicant.id, from_status: 'CHANGES_REQUESTED', to_status: 'DRAFT' })`
- **Does NOT assert:** specific timestamp values; that no other side effects occurred
- **Why:** Proves the happy-path reopen — the application moves back to DRAFT, the audit entry records the transition atomically, and the response returns the updated application summary.

### Test 2 — rejects unauthenticated requests to reopen an application (401)

- **Surface:** `ApplicationDraftReopeningsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `ApplicationFactory` (one record, any state)
  - Fakes: none
  - Auth: none (no `loginAs`)
  - Other: none
- **Action:** POST to `applicant.applications.reopen` with `{ id: application.id }`
- **Outcome contract:**
  - Status: 401
- **Does NOT assert:** response body shape (framework auth denial)
- **Why:** Proves the session guard blocks unauthenticated access to the reopen transition.

### Test 3 — rejects a non-owner applicant from reopening an application (403)

- **Surface:** `ApplicationDraftReopeningsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (non-owner applicant), `UserFactory` (owning applicant), `ApplicationFactory` (one CHANGES_REQUESTED application owned by the owning applicant)
  - Fakes: none
  - Auth: `loginAs(nonOwnerApplicant)` via session guard
  - Other: none
- **Action:** POST to `applicant.applications.reopen` with `{ id: application.id }`
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details-style error envelope
  - DB: `db.assertHas('applications', { id: application.id, status: 'CHANGES_REQUESTED' })` — row remains unchanged
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the policy enforces applicant ownership — a non-owner applicant cannot reopen another applicant's application.

### Test 4 — rejects reopening a non-eligible application with a conflict error (409)

- **Surface:** `ApplicationDraftReopeningsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `ApplicationFactory` (one application with status `'UNDER_REVIEW'` owned by the applicant — not eligible for reopening)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** POST to `applicant.applications.reopen` with `{ id: application.id }`
- **Outcome contract:**
  - Status: 409
  - Body: `{ errors: [{ message }] }` per `ApplicationTransitionConflictException`
  - DB: `db.assertHas('applications', { id: application.id, status: 'UNDER_REVIEW' })` — row remains unchanged; no new audit entry written for this application
- **Does NOT assert:** specific error message text; specific timestamp values
- **Why:** Proves the workflow rule that locks reopening when the application is not in the changes-requested state — the transition is rejected and the application remains unchanged.

### Test 5 — returns 404 for a non-existent application

- **Surface:** `ApplicationDraftReopeningsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** POST to `applicant.applications.reopen` with `{ id: 999999 }`
- **Outcome contract:**
  - Status: 404
  - Body: Problem Details-style error envelope
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the controller's `findOrFail` returns a 404 for non-existent applications rather than a conflict error.

## Factories audit

Reads: testing.md

| Factory | Existing / New | Used by |
| ------- | -------------- | ------- |
| `UserFactory` | new | T1, T3, T4, T5 |
| `ApplicationFactory` | new | T1, T2, T3, T4 |
| `ApplicationAuditEntryFactory` | new | T1 |

## Fakes audit

Reads: testing.md

No fakes or container swaps required. This slice has no external IO boundaries — `ApplicationWorkflowService` operates on the database only, which is exercised through the real DB in functional tests.

## Order rationale

Single surface; no ordering decisions required.

## Runner-model risks

Reads: testing.md

None identified. Every test creates its own factories, DB truncation via `group.each.setup` ensures state isolation, no container swaps or fakes are used, and all assertions follow status-before-body order with transformer-shaped bodies.
