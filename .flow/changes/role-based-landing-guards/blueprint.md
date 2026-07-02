---
planned: 2026-07-02
---

# Role-Based Landing Guards — Implementation Plan

> Task type: modification
> Stack: AdonisJS API
> Database: PostgreSQL

## Summary

Make the shared session-authenticated app feel role-aware by sending signed-in applicants and reviewers into the correct area and keeping unauthenticated or mismatched users out of role-specific areas. This is the first frontend-facing seam on top of the session model.

## Pre-implementation requirements

_None._

## Out of scope

_None._

## Current shape

- `apps/backend/start/routes.ts` already separates applicant and reviewer route groups under `/api/v1`.
- `apps/backend/app/controllers/reviewer_applications_controller.ts` already blocks non-reviewers at the controller entry point.
- `apps/backend/app/controllers/application_review_starts_controller.ts` already guards reviewer-only access.
- `apps/backend/app/controllers/profile_controller.ts` exists as the authenticated account entry point.
- `apps/backend/config/auth.ts` already configures session auth under the `web` guard.

## Target shape

Signed-in applicants and reviewers arrive in the right product area immediately after authentication. Unauthenticated users are kept out of protected areas, and a signed-in user cannot wander into the wrong role surface.

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
  - Existing applicant and reviewer checks already define the product boundary.
  - The plan keeps the role split explicit rather than collapsing it into a generic signed-in surface.

- Query segregation:
  - Applicant surfaces continue to depend on ownership.
  - Reviewer surfaces continue to depend on reviewer identity plus assignment where applicable.

## Controllers

Reads: controllers.md, http-context.md, request.md, middleware.md, model-relationships.md

- `apps/backend/app/controllers/access_tokens_controller.ts` (modified).
  - `store` — wiring: shared session sign-in, role detection, destination selection.
    - Send applicants and reviewers to their intended areas after sign-in.
  - `destroy` — wiring: existing logout.
    - Keep the sign-out path available for both roles.

- `apps/backend/app/controllers/profile_controller.ts` (modified).
  - `show` — wiring: authenticated user identity.
    - Serve as the signed-in account anchor for role-aware navigation.

- DI: method.

## Response layer

Reads: transformers.md, response.md, exception-handling.md

_n/a (task type: modification)_

## Routes

Reads: routing.md

_n/a (task type: modification)_

## Events + side effects

Reads: n/a

_n/a (task type: modification)_

## Test coverage gap

Existing route guards cover the backend side of the boundary. New tests should prove that the sign-in result sends each role to the correct area and that the protected areas remain closed to unauthenticated or mismatched users.

