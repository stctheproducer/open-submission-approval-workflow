# Application Submission History — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/application-submission-history/blueprint.md
> Date: 2026-07-02

## Summary

This plan covers the applicant-facing application detail route (with audit-log-backed history), the explicit submission transition resource, and the workflow rule that locks submission once the application leaves draft state. It asserts ownership scoping, authentication gating, atomic state transitions, and the ordered history payload on the detail response.

## Pre-implementation requirements

- **`UserFactory`** — required for authenticating test requests via `loginAs()`. File: `apps/backend/database/factories/user_factory.ts`.
- **`ApplicationFactory`** — required for seeding draft and submitted applications across show and submit tests. File: `apps/backend/database/factories/application_factory.ts`.
- **`ApplicationAuditLogEntryFactory`** — required for seeding history entries in the show-submitted-application test. File: `apps/backend/database/factories/application_audit_log_entry_factory.ts`.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Unauthenticated GET applications show → 401 | add | — |
| Authenticated applicant views own draft application, returns 200 + `{ data }` with empty history array | add | — |
| Authenticated applicant views own submitted application, returns 200 + `{ data }` with ordered history array (oldest-first) | add | — |
| Applicant views foreign or non-existent application via show → 404 (existence hidden) | add | — |
| Unauthenticated POST submissions store → 401 | add | — |
| Authenticated applicant submits own draft, returns 200 + `{ data }` with submitted detail and first history entry visible; DB has updated status and audit log row written atomically | add | — |
| Non-owner or non-existent application submission attempt → 404 (existence hidden) | add | — |
| Non-draft submission attempt → 409 conflict; application status unchanged; no new audit log row | add | — |
| Audit log written on draft create/update | skip | Blueprint explicitly excludes audit-log writes for draft edits; out of scope for this slice |
| Frontend workspace wiring | skip | Frontend; out of scope for API test plan |

## Test list (ordered)

Reads: testing.md

1. T1 [functional] — rejects unauthenticated requests to view an application (401)
2. T2 [functional] — shows an owned draft application with an empty history array (200)
3. T3 [functional] — shows an owned submitted application with the ordered history array (200)
4. T4 [functional] — returns 404 for a foreign or non-existent application
5. T5 [functional] — rejects unauthenticated requests to submit an application (401)
6. T6 [functional] — submits an owned draft application and returns the submitted detail with the first history entry (200)
7. T7 [functional] — returns 404 when submitting a foreign or non-existent application
8. T8 [functional] — rejects submission of a non-draft application with a conflict error (409)

## Per-test contracts

Reads: testing.md

### Test 1 — rejects unauthenticated requests to view an application (401)

- **Surface:** `ApplicationsController.show`
- **Suite:** functional
- **Setup:**
  - Factories: `ApplicationFactory` (one record, any owner)
  - Fakes: none
  - Auth: none (no `loginAs`)
  - Other: none
- **Action:** GET to `applications.show` with `{ id: application.id }`
- **Outcome contract:**
  - Status: 401
- **Does NOT assert:** response body shape (framework auth denial)
- **Why:** Proves the session guard blocks unauthenticated access to the application detail action.

### Test 2 — shows an owned draft application with an empty history array (200)

- **Surface:** `ApplicationsController.show`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `ApplicationFactory` (one draft owned by applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** GET to `applications.show` with `{ id: application.id }`
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: { id, applicantId, title, category, description, amount, status: 'DRAFT', createdAt, updatedAt, history: [] } }` per ApplicationTransformer detailed variant; `data.id` equals the requested application's id; `history` is an empty array
- **Does NOT assert:** that the model instance was loaded via a specific query strategy; specific timestamp values
- **Why:** Proves an applicant can view their own draft and that a draft with no transitions produces an empty history.

### Test 3 — shows an owned submitted application with the ordered history array (200)

- **Surface:** `ApplicationsController.show`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `ApplicationFactory` (one submitted application owned by applicant), `ApplicationAuditLogEntryFactory` (2 entries on the application, created with staggered timestamps so ordering is observable)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** GET to `applications.show` with `{ id: application.id }`
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: { id, status: 'SUBMITTED', history: [...] } }` per ApplicationTransformer detailed variant; `history` contains exactly 2 entries; entries are ordered oldest-first (by `recordedAt.raw` ascending); each entry includes `id`, `previousStatus`, `nextStatus`, `comment`, `recordedAt: { raw, formatted }`, and `performedBy` (transformed via UserTransformer); `performedBy` includes the actor's identifying fields
- **Does NOT assert:** specific `recordedAt.raw` or `recordedAt.formatted` string values; that the model instance was loaded via a specific query strategy
- **Why:** Proves the detail endpoint surfaces the audit-log-backed history in the correct order with the expected transformer shape.

### Test 4 — returns 404 for a foreign or non-existent application

- **Surface:** `ApplicationsController.show`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `UserFactory` (other applicant), `ApplicationFactory` (one draft owned by other applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: parameterized via `.with([...]).run(...)` across two rows: (a) `{ id: foreignApplication.id }`, (b) `{ id: 999999 }`
- **Action:** GET to `applications.show` with the parameterized id
- **Outcome contract:**
  - Status: 404 for both rows
  - Body: identical response shape for both rows (existence of foreign record is not revealed)
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the ownership policy hides foreign records behind the same 404 as genuinely missing records, preventing existence inference.

### Test 5 — rejects unauthenticated requests to submit an application (401)

- **Surface:** `ApplicationSubmissionsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `ApplicationFactory` (one record, any owner)
  - Fakes: none
  - Auth: none (no `loginAs`)
  - Other: none
- **Action:** POST to `applications.submissions.store` with `{ application_id: application.id }`
- **Outcome contract:**
  - Status: 401
- **Does NOT assert:** response body shape (framework auth denial)
- **Why:** Proves the session guard blocks unauthenticated access to the submission action.

### Test 6 — submits an owned draft application and returns the submitted detail with the first history entry (200)

- **Surface:** `ApplicationSubmissionsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `ApplicationFactory` (one draft owned by applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** POST to `applications.submissions.store` with `{ application_id: application.id }`
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: { id, status: 'SUBMITTED', history: [...] } }` per ApplicationTransformer detailed variant; `data.id` equals the application's id; `history` contains at least one entry with `previousStatus: 'DRAFT'`, `nextStatus: 'SUBMITTED'`, `recordedAt: { raw, formatted }`, and `performedBy` matching the applicant
  - DB: `db.assertHas('applications', { id: application.id, status: 'SUBMITTED' })`; `db.assertHas('application_audit_log_entries', { application_id: application.id, actor_user_id: applicant.id, previous_status: 'DRAFT', next_status: 'SUBMITTED' })`
- **Does NOT assert:** specific timestamp values; that no other side effects occurred
- **Why:** Proves the happy-path submission — the application leaves draft, the audit log records the transition atomically, and the response includes the first visible history entry.

### Test 7 — returns 404 when submitting a foreign or non-existent application

- **Surface:** `ApplicationSubmissionsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `UserFactory` (other applicant), `ApplicationFactory` (one draft owned by other applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: parameterized via `.with([...]).run(...)` across two rows: (a) `{ application_id: foreignApplication.id }`, (b) `{ application_id: 999999 }`
- **Action:** POST to `applications.submissions.store` with the parameterized id
- **Outcome contract:**
  - Status: 404 for both rows
  - Body: identical response shape for both rows (existence of foreign record is not revealed)
  - DB: no audit log row written for the foreign application (row a only; row b has no record to write against)
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the ownership policy hides foreign records behind the same 404 as genuinely missing records on the submission surface, and that no side effects occur.

### Test 8 — rejects submission of a non-draft application with a conflict error (409)

- **Surface:** `ApplicationSubmissionsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `ApplicationFactory` (one application owned by applicant with status `'SUBMITTED'`)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** POST to `applications.submissions.store` with `{ application_id: application.id }`
- **Outcome contract:**
  - Status: 409
  - Body: Problem Details-style error envelope per `ApplicationTransitionConflictException`
  - DB: `db.assertHas('applications', { id: application.id, status: 'SUBMITTED' })` — row remains unchanged; no new audit log row written for this application
- **Does NOT assert:** specific Problem Details `type` or `detail` strings; specific timestamp values
- **Why:** Proves the workflow rule that locks submission once the application leaves draft state — the transition is rejected and the application remains unchanged.

## Factories audit

Reads: testing.md

| Factory | Existing / New | Used by |
| ------- | -------------- | ------- |
| `UserFactory` | new | T2, T3, T4, T6, T7, T8 |
| `ApplicationFactory` | new | T1, T2, T3, T4, T5, T6, T7, T8 |
| `ApplicationAuditLogEntryFactory` | new | T3 |

## Fakes audit

Reads: testing.md

No fakes or container swaps required. This slice has no external IO boundaries — `ApplicationSubmissionService` operates on the database only, which is exercised through the real DB in functional tests.

## Order rationale

`show` (read surface) comes first; `store` (write surface) follows. Both are independent and use factories for test data, so no hard dependencies force this sequence.

## Runner-model risks

Reads: testing.md

None identified. Every test creates its own factories, DB truncation via `group.each.setup` ensures state isolation, no container swaps or fakes are used, parameterized tests use `.with().run()`, and all assertions follow status-before-body order with transformer-shaped bodies.
