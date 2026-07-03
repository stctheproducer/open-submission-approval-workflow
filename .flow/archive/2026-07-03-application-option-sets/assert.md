# Application Option Sets — Test Plan

> Stack: AdonisJS API
> Source: `.flow/changes/application-option-sets/blueprint.md`
> Date: 2026-07-03

## Summary

This plan covers the backend-owned category option set for draft applications. It also locks the draft create and update validators so unsupported categories fail through the same backend source of truth.

## Pre-implementation requirements

None.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| ------------------- | -------- | ----- |
| Authenticated applicant can fetch the shared category option set | add | — |
| Unauthenticated caller is rejected from the category option set endpoint | add | — |
| Draft creation still succeeds with valid existing payload fields | keep | `tests/functional/applications/store.spec.ts:creates a blank draft application for the authenticated applicant and returns the wrapped resource (201)` |
| Draft creation rejects invalid non-category payload fields with field-level errors | keep | `tests/functional/applications/store.spec.ts:rejects an invalid store payload with field-level errors (422)` |
| Draft creation rejects an unsupported category value | add | — |
| Owned draft update still succeeds with valid existing payload fields | keep | `tests/functional/applications/update.spec.ts:updates an owned draft application and returns the wrapped resource (200)` |
| Draft update rejects invalid non-category payload fields with field-level errors | keep | `tests/functional/applications/update.spec.ts:rejects an invalid update payload with field-level errors (422)` |
| Draft update rejects an unsupported category value | add | — |
| Unauthorized draft update remains rejected for foreign and non-existent applications | keep | `tests/functional/applications/update.spec.ts:returns 404 when updating a foreign or non-existent application — "{label}"` |
| Non-draft update conflict behavior remains unchanged | keep | `tests/functional/applications/update.spec.ts:rejects updates to a non-draft application with a conflict error` |

## Test list (ordered)

Reads: testing.md

1. `T1` functional - returns the shared category option set for authenticated applicants
2. `T2` functional - rejects unauthenticated requests for the category option set
3. `T3` functional - rejects an unsupported category during draft creation
4. `T4` functional - rejects an unsupported category during draft update
5. `T5` functional - keeps existing draft validation and update behavior intact

## Per-test contracts

Reads: testing.md

### T1

- Surface: `app/controllers/application_option_sets_controller.ts#index`
- Suite: functional
- Setup: create an authenticated applicant with `UserFactory`; no additional factories or fakes.
- Action: `GET` the new applicant category option-set route via `client.visit(...)` while logged in through the `web` guard.
- Outcome contract: status `200`; wrapped collection response under `{ data: [...] }`; body items reflect the backend-owned category option tuple with stable `value` and display label fields; the returned list is non-empty.
- Does NOT assert: pagination metadata, database rows, or frontend rendering.
- Why: proves the shared category option source is exposed to signed-in applicants from the backend.

### T2

- Surface: `app/controllers/application_option_sets_controller.ts#index`
- Suite: functional
- Setup: no auth; no factories or fakes.
- Action: `GET` the new applicant category option-set route without logging in.
- Outcome contract: status `401`.
- Does NOT assert: response body shape beyond the rejection status.
- Why: the route stays inside the authenticated applicant surface.

### T3

- Surface: `app/controllers/applications_controller.ts#store`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; no fakes.
- Action: `POST` the existing applicant draft creation route with an unsupported `category` value and otherwise valid draft payload fields.
- Outcome contract: status `422`; top-level `errors` array with a field-level validation error for `category`.
- Does NOT assert: response body beyond the validation error contract, database rows, or the option-set endpoint.
- Why: the create validator must reject category values outside the shared option set.

### T4

- Surface: `app/controllers/applications_controller.ts#update`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; draft application owned by that applicant via `ApplicationFactory`.
- Action: `PATCH` the existing applicant draft update route with an unsupported `category` value and otherwise valid draft payload fields.
- Outcome contract: status `422`; top-level `errors` array with a field-level validation error for `category`.
- Does NOT assert: response body beyond the validation error contract, database rows, or non-category field validation.
- Why: the update validator must reject category values outside the shared option set.

### T5

- Surface: `app/controllers/applications_controller.ts#store` and `app/controllers/applications_controller.ts#update`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; draft application owned by that applicant for update coverage.
- Action: keep using the existing store and update routes with their already-covered valid and invalid non-category payloads.
- Outcome contract: status `201` for draft creation success, `200` for draft update success, `422` for existing invalid payload failures, and `404` / `409` for the existing foreign / non-draft update coverage; all existing wrapped resource and error-body contracts remain intact.
- Does NOT assert: any new category-specific behavior, option-set payload shape, or frontend behavior.
- Why: guards against the validator changes regressing the existing draft flows.

## Runner-model risks

Reads: testing.md

- None identified. Each test is isolated to its own request and uses fresh factories or unauthenticated access where appropriate.
