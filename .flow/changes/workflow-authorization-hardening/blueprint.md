---
planned: 2026-07-02
---

# Workflow Authorization Hardening — Implementation Plan

> Task type: modification
> Stack: AdonisJS API
> Database: PostgreSQL

## Summary

Tighten the workflow authorization surface so applicant ownership, reviewer-only actions, and assigned-reviewer checks are enforced consistently across the existing workflow controllers and policy. This change is a security hardening pass over the current workflow entry points.

## Pre-implementation requirements

_None._

## Out of scope

_None._

## Current shape

- `apps/backend/app/policies/application_policy.ts` already holds the main applicant and reviewer checks.
- `apps/backend/app/controllers/application_submissions_controller.ts` currently uses a draft lookup service before submitting.
- `apps/backend/app/controllers/application_review_starts_controller.ts` checks reviewer role directly in the controller.
- `apps/backend/app/controllers/application_approvals_controller.ts`, `application_rejections_controller.ts`, and `application_change_requests_controller.ts` each mix role checks with policy authorization.
- `apps/backend/app/controllers/reviewer_applications_controller.ts` already filters reviewer queue access by reviewer identity and assignment.
- `apps/backend/app/exceptions/handler.ts` already normalizes authorization and conflict-like failures into the shared error shape.

## Target shape

Every workflow action has a clearly enforced boundary: applicants can only touch their own surfaces, reviewers can only perform reviewer actions, and in-review decisions are limited to the assigned reviewer. The behavior stays predictable across the workflow surface.

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
  - `view(user, application)` — applicant ownership check for applicant-scoped reads.
  - `update(user, application)` — applicant ownership check for applicant-scoped mutations.
  - `approve(user, application)` — reviewer role plus assignment check for approval.
  - `requestChange(user, application)` — reviewer role plus assignment check for change requests.
  - `reject(user, application)` — reviewer role plus assignment check for rejections.
  - `reopenDraft(user, application)` — applicant ownership check for reopening.

- Query segregation:
  - Applicant reads and mutations continue to scope through ownership.
  - Reviewer queue and review decisions continue to scope through reviewer identity and assignment.

## Controllers

Reads: controllers.md, http-context.md, request.md, middleware.md, model-relationships.md

- `apps/backend/app/controllers/application_submissions_controller.ts` (modified).
  - `store` — wiring: authenticated applicant, draft lookup, submission service.
    - The draft lookup remains the applicant ownership gate before submission.

- `apps/backend/app/controllers/application_review_starts_controller.ts` (modified).
  - `store` — wiring: authenticated reviewer, review-start service.
    - Reviewer role remains a hard entry-point check.

- `apps/backend/app/controllers/application_approvals_controller.ts` (modified).
  - `store` — wiring: reviewer role check, application lookup, policy authorization, approval service.
    - Policy check keeps assignment-aware access in the controller boundary.

- `apps/backend/app/controllers/application_rejections_controller.ts` (modified).
  - `store` — wiring: reviewer role check, application lookup, policy authorization, validation, workflow service.
    - Role gate and assignment gate both remain explicit.

- `apps/backend/app/controllers/application_change_requests_controller.ts` (modified).
  - `store` — wiring: reviewer role check, validation, application lookup, policy authorization, workflow service.
    - Keep the reviewer boundary and the assignment boundary separate and visible.

- `apps/backend/app/controllers/reviewer_applications_controller.ts` (modified).
  - `index` and `show` — wiring: reviewer role check, reviewer queue scope, application preloads.
    - The current reviewer queue scope remains the segregation point.

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

The current tests likely cover the happy path transitions already. New tests should prove that applicant ownership remains enforced, non-reviewers are rejected from reviewer actions, and the assigned reviewer is the only reviewer who can complete in-review decisions.

