# Application Approval — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/application-approval/blueprint.md
> Date: 2026-07-02

## Summary

This plan covers the reviewer approval transition for `Application` records: an authenticated, assigned reviewer can approve an under-review application, the approval is written as an auditable status transition, and the response includes the approved status with visible history. It asserts authentication gating, reviewer-role and assignment authorization, the atomic status transition with audit-log write, and conflict rejection for ineligible applications.

## Pre-implementation requirements

- **`UserFactory`** — required for authenticating test requests via `loginAs()` and seeding applicant vs reviewer role variants. File: `apps/backend/database/factories/user_factory.ts`.
- **`ApplicationFactory`** — required for seeding applications in various workflow states and assignment configurations. File: `apps/backend/database/factories/application_factory.ts`.
- **`ApplicationStatusTransitionFactory`** — required for seeding prior transition history so the approval response includes a realistic audit trail. File: `apps/backend/database/factories/application_status_transition_factory.ts`.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Unauthenticated POST approvals → 401 | add | — |
| Non-reviewer (applicant role) POST approvals → 403 | add | — |
| Unassigned reviewer POST approvals → 403 | add | — |
| Assigned reviewer approves eligible under-review application → 200, status `APPROVED`, audit log row written, visible history includes approval entry | add | — |
| Assigned reviewer approves non-eligible application (not under review) → 409 conflict, application unchanged, no new audit log row | add | — |
| Approval visible in application history for both reviewer and applicant views | skip | Observed via the approval response body itself (test above); no separate show surface in this slice |
| Unit test: `ApplicationApprovalService` writes status change and audit log together | skip | Functional happy-path test already asserts both DB rows via `db.assertHas`; redundant |
| Unit test: failed approval paths leave rows unchanged | skip | Functional 403 and 409 tests already verify application unchanged and no new transition row; redundant |
| Frontend changes | skip | Out of scope for this slice |

## Test list (ordered)

Reads: testing.md

1. T1 [functional] — rejects unauthenticated requests to approve an application (401)
2. T2 [functional] — rejects non-reviewer users from approving an application (403)
3. T3 [functional] — rejects an unassigned reviewer from approving an application (403)
4. T4 [functional] — approves an eligible under-review application and returns the approved detail with history (200)
5. T5 [functional] — rejects approval of a non-eligible application with a conflict error (409)

## Per-test contracts

Reads: testing.md

### Test 1 — rejects unauthenticated requests to approve an application (401)

- **Surface:** `ApplicationApprovalsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `ApplicationFactory` (one record, any state)
  - Fakes: none
  - Auth: none (no `loginAs`)
  - Other: none
- **Action:** POST to the approvals route with `{ applicationId: application.id }`
- **Outcome contract:**
  - Status: 401
- **Does NOT assert:** response body shape (framework auth denial)
- **Why:** Proves the session guard blocks unauthenticated access to the approval transition.

### Test 2 — rejects non-reviewer users from approving an application (403)

- **Surface:** `ApplicationApprovalsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant role), `UserFactory` (other applicant, for ownership), `ApplicationFactory` (one UNDER_REVIEW application owned by the other applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** POST to the approvals route with `{ applicationId: application.id }`
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details-style error envelope
  - DB: `db.assertHas('applications', { id: application.id, status: 'UNDER_REVIEW' })` — row remains unchanged
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the reviewer-workspace ability gates the approval action to reviewer-role users only, and that no state changes occur on denial.

### Test 3 — rejects an unassigned reviewer from approving an application (403)

- **Surface:** `ApplicationApprovalsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (unassigned reviewer), `UserFactory` (assigned reviewer), `UserFactory` (applicant), `ApplicationFactory` (one UNDER_REVIEW application assigned to the assigned reviewer, not the unassigned one)
  - Fakes: none
  - Auth: `loginAs(unassignedReviewer)` via session guard
  - Other: none
- **Action:** POST to the approvals route with `{ applicationId: application.id }`
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details-style error envelope
  - DB: `db.assertHas('applications', { id: application.id, status: 'UNDER_REVIEW', reviewer_id: assignedReviewer.id })` — row remains unchanged
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the policy enforces reviewer assignment — a reviewer who is not assigned to the application cannot approve it.

### Test 4 — approves an eligible under-review application and returns the approved detail with history (200)

- **Surface:** `ApplicationApprovalsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (assigned reviewer), `UserFactory` (applicant), `ApplicationFactory` (one UNDER_REVIEW application assigned to the reviewer), `ApplicationStatusTransitionFactory` (one prior transition: SUBMITTED → UNDER_REVIEW)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** POST to the approvals route with `{ applicationId: application.id }`
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: { id, status: 'APPROVED', applicant, reviewer, statusTransitions: [...] } }` per ApplicationTransformer `forDetailedView` variant; `data.status` equals `'APPROVED'`; `data.applicant` is a UserTransformer output; `data.reviewer` is a UserTransformer output matching the reviewer; `data.statusTransitions` contains the prior transition plus the new approval entry with `previousStatus: 'UNDER_REVIEW'`, `nextStatus: 'APPROVED'`, and `actor` matching the reviewer
  - DB: `db.assertHas('applications', { id: application.id, status: 'APPROVED' })`; `db.assertHas('application_status_transitions', { application_id: application.id, actor_id: reviewer.id, previous_status: 'UNDER_REVIEW', next_status: 'APPROVED' })`
- **Does NOT assert:** specific timestamp values; that no other side effects occurred
- **Why:** Proves the happy-path approval — the application moves to APPROVED, the audit log records the transition atomically, and the response includes the full visible history with the approval entry.

### Test 5 — rejects approval of a non-eligible application with a conflict error (409)

- **Surface:** `ApplicationApprovalsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (assigned reviewer), `UserFactory` (applicant), `ApplicationFactory` (one application with status `'APPROVED'` assigned to the reviewer — already approved, not eligible for another approval)
  - Fakes: none
  - Auth: `loginAs(reviewer)` via session guard
  - Other: none
- **Action:** POST to the approvals route with `{ applicationId: application.id }`
- **Outcome contract:**
  - Status: 409
  - Body: Problem Details-style error envelope per `ApplicationTransitionConflictException`
  - DB: `db.assertHas('applications', { id: application.id, status: 'APPROVED' })` — row remains unchanged; no new audit log row written for this application
- **Does NOT assert:** specific Problem Details `type` or `detail` strings; specific timestamp values
- **Why:** Proves the workflow rule that locks approval once the application is no longer under review — the transition is rejected and the application remains unchanged.

## Factories audit

Reads: testing.md

| Factory | Existing / New | Used by |
| ------- | -------------- | ------- |
| `UserFactory` | new | T2, T3, T4, T5 |
| `ApplicationFactory` | new | T1, T2, T3, T4, T5 |
| `ApplicationStatusTransitionFactory` | new | T4 |

## Fakes audit

Reads: testing.md

No fakes or container swaps required. This slice has no external IO boundaries — `ApplicationApprovalService` operates on the database only, which is exercised through the real DB in functional tests.

## Order rationale

Single surface; no ordering decisions required.

## Runner-model risks

Reads: testing.md

None identified. Every test creates its own factories, DB truncation via `group.each.setup` ensures state isolation, no container swaps or fakes are used, and all assertions follow status-before-body order with transformer-shaped bodies.
