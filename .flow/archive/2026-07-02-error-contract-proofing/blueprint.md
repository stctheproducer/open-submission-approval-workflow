---
planned: 2026-07-02
built: 2026-07-02
---

# Error Contract Proofing — Implementation Plan

> Task type: modification
> Stack: AdonisJS API
> Database: PostgreSQL

## Summary

Standardize the workflow failure envelope so validation, forbidden, not-found, and conflict failures all present the same shared API shape. This slice is about proving the contract, not broadening workflow behavior.

## Pre-implementation requirements

_None._

## Out of scope

_None._

## Current shape

- `apps/backend/app/exceptions/handler.ts` already converts 400, 401, 403, 404, 409, and 422 status-bearing errors into a shared `{ errors: [...] }` body.
- `apps/backend/app/controllers/application_change_requests_controller.ts` already returns a controller-shaped response for one workflow path.
- `apps/backend/app/controllers/application_rejections_controller.ts` uses the shared validator and policy flow on its path.
- `apps/backend/app/exceptions/application_transition_conflict_exception.ts` and related exceptions already exist as self-handled conflict surfaces.
- `apps/backend/app/policies/application_policy.ts` already yields 403/404 style denials for ownership and assignment checks.

## Target shape

Workflow and authorization failures are normalized into one shared error contract that the frontend can treat consistently. Conflict, forbidden, not-found, and validation cases all look like the same class of API failure even though their status codes differ.

## Logical schema

Reads: models.md, migrations.md, schema-rules.md

_n/a (task type: modification)_

## Migrations + models

Reads: migrations.md, models.md

_n/a (task type: modification)_

## Service design

Reads: controllers.md

_n/a (task type: modification)_

## Validation

Reads: validation.md, vine/types

_n/a (task type: modification)_

## Authorization + segregation

Reads: authentication.md, authorization.md

- `apps/backend/app/policies/application_policy.ts` — `ApplicationPolicy`.
  - Ownership and assignment denials continue to surface as shared-contract authorization failures.

- Query segregation:
  - No new segregation shape is introduced; the plan standardizes the failure contract around existing workflow and authorization checks.

## Controllers

Reads: controllers.md, http-context.md, request.md, middleware.md, model-relationships.md

- `apps/backend/app/controllers/application_approvals_controller.ts` (modified).
  - `store` — wiring: reviewer role check, policy authorization, approval service, shared error handling.

- `apps/backend/app/controllers/application_rejections_controller.ts` (modified).
  - `store` — wiring: reviewer role check, validation, policy authorization, workflow service, shared error handling.

- `apps/backend/app/controllers/application_change_requests_controller.ts` (modified).
  - `store` — wiring: reviewer role check, validation, policy authorization, workflow service, shared error handling.

- `apps/backend/app/controllers/application_submissions_controller.ts` (modified).
  - `store` — wiring: applicant ownership lookup, submission service, shared error handling.

- `apps/backend/app/controllers/reviewer_applications_controller.ts` (modified).
  - `index` and `show` — wiring: reviewer role check, reviewer queue scope, shared error handling.

- DI: method.

## Response layer

Reads: transformers.md, response.md, exception-handling.md

- `apps/backend/app/exceptions/handler.ts` — existing shared failure normalizer.
  - Recoverable errors: validation failures, forbidden failures, not-found failures, conflict failures.
  - Self-handled exceptions thrown: existing conflict exceptions and shared authorization/not-found errors that already carry status codes.
  - Success responses are unchanged.

- Wrapping mode: `serialize.withoutWrapping` for error responses through the handler contract.
- Success status: unchanged per action.

## Routes

Reads: routing.md

_n/a (task type: modification)_

## Events + side effects

Reads: n/a

_n/a (task type: modification)_

## Test coverage gap

Add representative tests that hit validation, forbidden, not-found, and conflict failures across workflow and authorization surfaces and assert the shared error shape stays the same.
