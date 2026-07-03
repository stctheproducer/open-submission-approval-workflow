# Application Approval — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/application-approval/blueprint.md
> Date: 2026-07-03

## Summary

This plan covers the reviewer approval action and the approved detail payload it returns. It locks the assignment checks, the approval-state transition, and the rejected branches that protect the workflow.

## Pre-implementation requirements

_None._

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| ------------------- | -------- | ----- |
| Unauthenticated approval requests return 401 | keep | tests/functional/applications/approvals.spec.ts:rejects unauthenticated requests to approve an application (401) |
| Non-reviewer users are forbidden from approving | keep | tests/functional/applications/approvals.spec.ts:rejects non-reviewer users from approving an application (403) |
| An unassigned reviewer is forbidden from approving | keep | tests/functional/applications/approvals.spec.ts:rejects an unassigned reviewer from approving an application (403) |
| Approving an eligible under-review application returns the approved detail payload | keep | tests/functional/applications/approvals.spec.ts:approves an eligible under-review application and returns the approved detail with history (200) |
| Approving a non-eligible application returns a conflict | keep | tests/functional/applications/approvals.spec.ts:rejects approval of a non-eligible application with a conflict error (409) |

## Test list (ordered)

Reads: testing.md

1. `T1 [functional]` - rejects unauthenticated requests to approve an application (401)
2. `T2 [functional]` - rejects non-reviewer users from approving an application (403)
3. `T3 [functional]` - rejects an unassigned reviewer from approving an application (403)
4. `T4 [functional]` - approves an eligible under-review application and returns the approved detail with history (200)
5. `T5 [functional]` - rejects approval of a non-eligible application with a conflict error (409)

## Per-test contracts

Reads: testing.md

### Test 1 — rejects unauthenticated requests to approve an application (401)

- **Surface:** `ApplicationApprovalsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `ApplicationFactory`
  - Fakes: none
  - Auth: none
  - Other: create an under-review application
- **Action:** `POST reviewer.application_approvals.store` for the application id
- **Outcome contract:**
  - Status: 401
  - Body: Problem Details error envelope for unauthorized access
  - DB / fake / exception assertions: `assertProblemDetails(response.body(), 401)`
- **Does NOT assert:** approval payload shape, reviewer assignment, or any row mutation
- **Why:** approval is a reviewer-only decision and must reject anonymous access first

### Test 2 — rejects non-reviewer users from approving an application (403)

- **Surface:** `ApplicationApprovalsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory`, `ApplicationFactory`
  - Fakes: none
  - Auth: signed-in web user who is not a reviewer
  - Other: create an under-review application
- **Action:** `POST reviewer.application_approvals.store` for the application id
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details error envelope for forbidden access
  - DB / fake / exception assertions: `assertProblemDetails(response.body(), 403)`
- **Does NOT assert:** approval payload shape or any row mutation
- **Why:** the approval action must stay inaccessible to applicant users

### Test 3 — rejects an unassigned reviewer from approving an application (403)

- **Surface:** `ApplicationApprovalsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory`, `ApplicationFactory`
  - Fakes: none
  - Auth: signed-in reviewer who is not assigned to the application
  - Other: create an under-review application assigned to a different reviewer
- **Action:** `POST reviewer.application_approvals.store` for the application id
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details error envelope for forbidden access
  - DB / fake / exception assertions: `assertProblemDetails(response.body(), 403)`; the application remains assigned to the original reviewer
- **Does NOT assert:** approval payload shape or approval-row insertion
- **Why:** assignment is part of the approval gate and must be enforced before the transition runs

### Test 4 — approves an eligible under-review application and returns the approved detail with history (200)

- **Surface:** `ApplicationApprovalsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory`, `ApplicationFactory`, `ApplicationStatusTransitionFactory`
  - Fakes: none
  - Auth: signed-in assigned reviewer
  - Other: create an under-review application and seed its prior submitted -> under_review transition
- **Action:** `POST reviewer.application_approvals.store` for the application id
- **Outcome contract:**
  - Status: 200
  - Body: detailed application payload with `status = approved`, `reviewer.id` set to the current reviewer, and `statusTransitions.length === 2`
  - DB / fake / exception assertions: the `applications` row is updated with `status = approved` and `assigned_reviewer_id = reviewer.id`; an `application_status_transitions` row exists with the under_review -> approved transition
- **Does NOT assert:** queue filtering, change-request behavior, or any other decision path
- **Why:** approval is the terminal reviewer decision and must atomically update the application and transition history

### Test 5 — rejects approval of a non-eligible application with a conflict error (409)

- **Surface:** `ApplicationApprovalsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory`, `ApplicationFactory`
  - Fakes: none
  - Auth: signed-in assigned reviewer
  - Other: create an application that is already approved
- **Action:** `POST reviewer.application_approvals.store` for the application id
- **Outcome contract:**
  - Status: 409
  - Body: Problem Details error envelope for the conflict
  - DB / fake / exception assertions: `assertProblemDetails(response.body(), 409)`; the application row remains approved and assigned to the same reviewer
- **Does NOT assert:** approved payload shape or transition insertion
- **Why:** the approval action must fail cleanly when the application is no longer eligible

## Factories audit

Reads: testing.md

| Test | Factory | Existing / New |
| ---- | ------- | -------------- |
| T1 | ApplicationFactory | Existing |
| T2 | UserFactory, ApplicationFactory | Existing |
| T3 | UserFactory, ApplicationFactory | Existing |
| T4 | UserFactory, ApplicationFactory, ApplicationStatusTransitionFactory | Existing |
| T5 | UserFactory, ApplicationFactory | Existing |

## Fakes audit

Reads: testing.md

| Test | Fake / swap | Binding + file |
| ---- | ----------- | -------------- |
| T1 | none | n/a |
| T2 | none | n/a |
| T3 | none | n/a |
| T4 | none | n/a |
| T5 | none | n/a |

## Order rationale

The anonymous and role-based rejections come before the assignment check so the access-control layers are exercised in the same order the controller enforces them. The eligible approval test comes before the conflict case because it proves the intended workflow before the rejection branch.

## Runner-model risks

Reads: testing.md

None identified.

## Open questions

None.
