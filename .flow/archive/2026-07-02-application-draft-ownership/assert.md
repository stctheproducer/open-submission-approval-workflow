# Application Draft Ownership — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/application-draft-ownership/blueprint.md
> Date: 2026-07-02

## Summary

This plan covers the applicant-owned draft lifecycle for `Application` records: creating a draft, listing owned applications, viewing an owned draft, and updating a draft while it remains editable. It asserts ownership scoping, authentication gating, validation, and the workflow rule that locks editing once the application leaves draft state.

## Pre-implementation requirements

- **`UserFactory`** — required for authenticating test requests via `loginAs()`. File: `apps/backend/database/factories/user_factory.ts`.
- **`ApplicationFactory`** — required for seeding owned drafts, foreign records, and non-draft records across index, show, and update tests. File: `apps/backend/database/factories/application_factory.ts`.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Unauthenticated GET applications index → 401 | add | — |
| Authenticated applicant lists only own applications, paginated, newest-first, wrapped `{ data, meta }` | add | — |
| Applicant with zero applications gets empty paginated collection | add | — |
| Unauthenticated POST applications store → 401 | add | — |
| Authenticated applicant creates a blank draft, returns 201 + `{ data }` per ApplicationTransformer | add | — |
| Invalid store payload → 422 with `{ errors }` field-level messages | add | — |
| Unauthenticated GET applications show → 401 | add | — |
| Authenticated applicant views own draft, returns 200 + `{ data }` per ApplicationTransformer | add | — |
| Applicant requests another applicant's application → 404 (existence hidden) | add | — |
| Applicant requests non-existent application → 404 | add | — |
| Unauthenticated PUT applications update → 401 | add | — |
| Authenticated applicant updates own draft, returns 200 + `{ data }` per ApplicationTransformer | add | — |
| Invalid update payload → 422 with `{ errors }` field-level messages | add | — |
| Applicant updates another applicant's application → 404 (existence hidden) | add | — |
| Applicant updates a non-draft application → conflict error, application unchanged | add | — |
| Audit log written on draft create/update | skip | Blueprint explicitly excludes audit-log writes for draft edits |
| Frontend workspace wiring | skip | Frontend; out of scope for API test plan |

## Test list (ordered)

Reads: testing.md

1. T1 [functional] — creates a blank draft application for the authenticated applicant and returns the wrapped resource (201)
2. T2 [functional] — rejects unauthenticated requests to create an application (401)
3. T3 [functional] — rejects an invalid store payload with field-level errors (422)
4. T4 [functional] — rejects unauthenticated requests to the applications index (401)
5. T5 [functional] — lists only the authenticated applicant's own applications with pagination metadata
6. T6 [functional] — returns an empty paginated collection when the applicant has no applications
7. T7 [functional] — rejects unauthenticated requests to view an application (401)
8. T8 [functional] — shows an owned draft application and returns the wrapped resource (200)
9. T9 [functional] — returns 404 for a foreign or non-existent application
10. T10 [functional] — rejects unauthenticated requests to update an application (401)
11. T11 [functional] — updates an owned draft application and returns the wrapped resource (200)
12. T12 [functional] — rejects an invalid update payload with field-level errors (422)
13. T13 [functional] — returns 404 when updating a foreign or non-existent application
14. T14 [functional] — rejects updates to a non-draft application with a conflict error

## Per-test contracts

Reads: testing.md

### Test 1 — creates a blank draft application for the authenticated applicant and returns the wrapped resource (201)

- **Surface:** `ApplicationsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** POST to `applicant.applications.store` with empty JSON body `{}`
- **Outcome contract:**
  - Status: 201
  - Body: `{ data: { id, status: 'draft' } }` per ApplicationTransformer; `data.id` is a number; `data.status` equals `'draft'`
  - DB: `db.assertHas('applications', { user_id: applicant.id, status: 'draft' })`
- **Does NOT assert:** specific values of optional draft fields beyond id and status; that no audit-log row was written
- **Why:** Proves the foundational create behavior — an authenticated applicant can establish a new draft record with correct ownership.

### Test 2 — rejects unauthenticated requests to create an application (401)

- **Surface:** `ApplicationsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: none
  - Fakes: none
  - Auth: none (no `loginAs`)
  - Other: none
- **Action:** POST to `applicant.applications.store` with empty JSON body `{}`
- **Outcome contract:**
  - Status: 401
- **Does NOT assert:** response body shape (framework auth denial)
- **Why:** Proves the session guard blocks unauthenticated access to the store action.

### Test 3 — rejects an invalid store payload with field-level errors (422)

- **Surface:** `ApplicationsController.store`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** POST to `applicant.applications.store` with a payload that violates the create validator (e.g., a field with an invalid type or disallowed value)
- **Outcome contract:**
  - Status: 422
  - Body: `{ errors: [{ field, message, rule }] }` per validation error wrapping; at least one error entry present
- **Does NOT assert:** that no DB row was created (validator runs before persistence)
- **Why:** Proves the create validator rejects malformed input before any record is created.

### Test 4 — rejects unauthenticated requests to the applications index (401)

- **Surface:** `ApplicationsController.index`
- **Suite:** functional
- **Setup:**
  - Factories: none
  - Fakes: none
  - Auth: none (no `loginAs`)
  - Other: none
- **Action:** GET to `applicant.applications.index`
- **Outcome contract:**
  - Status: 401
- **Does NOT assert:** response body shape (framework auth denial)
- **Why:** Proves the session guard blocks unauthenticated access to the index action.

### Test 5 — lists only the authenticated applicant's own applications with pagination metadata

- **Surface:** `ApplicationsController.index`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `UserFactory` (other applicant), `ApplicationFactory` (3 rows owned by applicant), `ApplicationFactory` (2 rows owned by other applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** GET to `applicant.applications.index`
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: [...], meta: { ... } }` per paginated wrapping; `data` has length 3; every item in `data` has an `id` matching one of the applicant's 3 records; no item matches the other applicant's records; `data` is ordered newest-first (by `createdAt` descending); `meta` contains pagination fields
- **Does NOT assert:** specific pagination cursor values; exact meta field names beyond what the serializer produces
- **Why:** Proves ownership scoping, pagination wrapping, and default ordering in a single request.

### Test 6 — returns an empty paginated collection when the applicant has no applications

- **Surface:** `ApplicationsController.index`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** GET to `applicant.applications.index`
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: [], meta: { ... } }`; `data` is an empty array; `meta` contains pagination fields
- **Does NOT assert:** specific meta values
- **Why:** Proves the index handles the zero-records case gracefully with correct wrapping.

### Test 7 — rejects unauthenticated requests to view an application (401)

- **Surface:** `ApplicationsController.show`
- **Suite:** functional
- **Setup:**
  - Factories: `ApplicationFactory` (one record, any owner)
  - Fakes: none
  - Auth: none (no `loginAs`)
  - Other: none
- **Action:** GET to `applicant.applications.show` with `{ id: application.id }`
- **Outcome contract:**
  - Status: 401
- **Does NOT assert:** response body shape (framework auth denial)
- **Why:** Proves the session guard blocks unauthenticated access to the show action.

### Test 8 — shows an owned draft application and returns the wrapped resource (200)

- **Surface:** `ApplicationsController.show`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `ApplicationFactory` (one draft owned by applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** GET to `applicant.applications.show` with `{ id: application.id }`
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: { id, status: 'draft' } }` per ApplicationTransformer; `data.id` equals the requested application's id
- **Does NOT assert:** that the model instance was loaded via a specific query strategy
- **Why:** Proves an applicant can reopen and view their own draft through the detail endpoint.

### Test 9 — returns 404 for a foreign or non-existent application

- **Surface:** `ApplicationsController.show`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `UserFactory` (other applicant), `ApplicationFactory` (one draft owned by other applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: parameterized via `.with([...]).run(...)` across two rows: (a) `{ id: foreignApplication.id }`, (b) `{ id: 999999 }`
- **Action:** GET to `applicant.applications.show` with the parameterized id
- **Outcome contract:**
  - Status: 404 for both rows
  - Body: identical response shape for both rows (existence of foreign record is not revealed)
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the ownership policy hides foreign records behind the same 404 as genuinely missing records, preventing existence inference.

### Test 10 — rejects unauthenticated requests to update an application (401)

- **Surface:** `ApplicationsController.update`
- **Suite:** functional
- **Setup:**
  - Factories: `ApplicationFactory` (one record, any owner)
  - Fakes: none
  - Auth: none (no `loginAs`)
  - Other: none
- **Action:** PUT to `applicant.applications.update` with `{ id: application.id }` and a valid JSON body
- **Outcome contract:**
  - Status: 401
- **Does NOT assert:** response body shape (framework auth denial)
- **Why:** Proves the session guard blocks unauthenticated access to the update action.

### Test 11 — updates an owned draft application and returns the wrapped resource (200)

- **Surface:** `ApplicationsController.update`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `ApplicationFactory` (one draft owned by applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** PUT to `applicant.applications.update` with `{ id: application.id }` and a valid update payload per the update validator
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: { id, ...updated fields } }` per ApplicationTransformer; `data.id` equals the application's id; updated fields reflect the submitted values
  - DB: `db.assertHas('applications', { id: application.id, ...updated column values })`
- **Does NOT assert:** that no audit-log row was written; timestamps beyond what the transformer exposes
- **Why:** Proves the happy-path edit — an applicant can save changes to their own draft and see the updated values reflected.

### Test 12 — rejects an invalid update payload with field-level errors (422)

- **Surface:** `ApplicationsController.update`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `ApplicationFactory` (one draft owned by applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** PUT to `applicant.applications.update` with `{ id: application.id }` and a payload that violates the update validator
- **Outcome contract:**
  - Status: 422
  - Body: `{ errors: [{ field, message, rule }] }` per validation error wrapping; at least one error entry present
- **Does NOT assert:** that the DB row is unchanged (validator runs before persistence)
- **Why:** Proves the update validator rejects malformed input before any record is modified.

### Test 13 — returns 404 when updating a foreign or non-existent application

- **Surface:** `ApplicationsController.update`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `UserFactory` (other applicant), `ApplicationFactory` (one draft owned by other applicant)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: parameterized via `.with([...]).run(...)` across two rows: (a) `{ id: foreignApplication.id }`, (b) `{ id: 999999 }`
- **Action:** PUT to `applicant.applications.update` with the parameterized id and a valid update payload
- **Outcome contract:**
  - Status: 404 for both rows
  - Body: identical response shape for both rows (existence of foreign record is not revealed)
- **Does NOT assert:** specific Problem Details field values beyond status
- **Why:** Proves the ownership policy hides foreign records behind the same 404 as genuinely missing records on the update surface.

### Test 14 — rejects updates to a non-draft application with a conflict error

- **Surface:** `ApplicationsController.update`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory` (applicant), `ApplicationFactory` (one record owned by applicant with status set to a non-draft value, e.g. `'submitted'`)
  - Fakes: none
  - Auth: `loginAs(applicant)` via session guard
  - Other: none
- **Action:** PUT to `applicant.applications.update` with `{ id: application.id }` and a valid update payload
- **Outcome contract:**
  - Status: 409
  - Body: Problem Details-style error envelope per the app's exception handler
  - DB: `db.assertHas('applications', { id: application.id, status: 'submitted' })` — row remains unchanged with original values
- **Does NOT assert:** specific Problem Details `type` or `detail` strings; that no audit-log row was written
- **Why:** Proves the workflow rule that locks editing once the application leaves draft state — the payload may be valid but the state transition is not.

## Factories audit

Reads: testing.md

| Factory | Existing / New | Used by |
| ------- | -------------- | ------- |
| `UserFactory` | new | T1, T3, T5, T6, T8, T9, T11, T12, T13, T14 |
| `ApplicationFactory` | new | T5, T7, T8, T9, T10, T11, T12, T13, T14 |

## Fakes audit

Reads: testing.md

No fakes or container swaps required. This slice has no external IO boundaries — `ApplicationDraftService` operates on the database only, which is exercised through the real DB in functional tests.

## Order rationale

`store` comes first because it establishes the foundational create behavior. The remaining surfaces follow natural CRUD order: `index` (list), `show` (detail), `update` (edit). All surfaces use factories for test data, so no hard dependencies force a different sequence.

## Runner-model risks

Reads: testing.md

None identified. Every test creates its own factories, DB truncation via `group.each.setup` ensures state isolation, no container swaps or fakes are used, parameterized tests use `.with().run()`, and all assertions follow status-before-body order with transformer-shaped bodies.

---
