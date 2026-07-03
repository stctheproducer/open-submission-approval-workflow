---
planned: 2026-07-03
built: 2026-07-03
---

# Application Approval — Implementation Plan

> Task type: extension
> Stack: AdonisJS API + React/Vite frontend
> Database: PostgreSQL

## Summary

The approval backend path already exists. This slice wires the approval decision into the reviewer detail experience and gives the reviewer a visible, eligible-only approval action in the frontend.

## Pre-implementation requirements

_None._

## Out of scope

- Reworking rejection or change-request flows. This stays on approval only.

## Current shape

- Backend already exposes an approval action, the authorization rules for assigned reviewers, and a detailed approved payload.
- The frontend does not yet render reviewer decision actions.
- Existing backend tests already cover the approved state and conflict cases.

## Target shape

An assigned reviewer can approve an eligible application from the reviewer detail view, and the approval action is only presented when the application is actually eligible.

## Controllers

Reads: controllers.md

- `apps/backend/app/controllers/application_approvals_controller.ts` (modified if needed for response shape only).
  - `store` - authorize the assigned reviewer and complete the approval transition.

## Response layer

Reads: transformers.md, response.md

- `apps/backend/app/transformers/application_transformer.ts` - keep the detailed-view variant used after approval.
- Wrapping mode: `serialize` for the single resource.
- Success status: `response.status(200)`.
- Self-handled exceptions thrown: existing conflict and authorization exceptions from the approval path.

## Authorization + segregation

Reads: authorization.md

- `apps/backend/app/policies/application_policy.ts`
  - `approve` continues to enforce reviewer role plus assignment.

## Test coverage gap

Backend approval coverage exists. The gap is the reviewer-facing frontend flow: showing the approval action only when eligible and reflecting the approved state after success.
