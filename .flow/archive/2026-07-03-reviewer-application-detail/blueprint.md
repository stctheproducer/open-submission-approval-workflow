---
planned: 2026-07-03
built: 2026-07-03
---

# Reviewer Application Detail — Implementation Plan

> Task type: extension
> Stack: AdonisJS API + React/Vite frontend
> Database: PostgreSQL

## Summary

The backend already returns reviewer-oriented application detail payloads. This slice adds the reviewer-facing detail page in the frontend so reviewers can inspect an application and its history before deciding what to do with it.

## Pre-implementation requirements

_None._

## Out of scope

- Changing the audit/history contract itself. The page consumes the existing transition history.

## Current shape

- Backend already exposes a reviewer application show route that preloads the application owner, assigned reviewer, and history.
- The application transformer already includes a detailed-view variant.
- The frontend has no reviewer detail page yet.

## Target shape

The reviewer can open an application from the queue, see the current record and its history in one place, and use that context for the next decision.

## Routes

Reads: routing.md

```diff title="<monorepo-app>/start/routes.ts"
@@
       router
         .group(() => {
           router.resource('applications', controllers.ReviewerApplications).only(['index', 'show'])
@@
```

Verify route names with `cd <monorepo-app> && node ace list:routes`.

## Controllers

Reads: controllers.md

- `apps/backend/app/controllers/reviewer_applications_controller.ts` (modified if needed for payload shape only).
  - `show` - return the detail payload used by the reviewer view.

## Response layer

Reads: transformers.md, response.md

- `apps/backend/app/transformers/application_transformer.ts` - keep the detailed-view variant aligned with the reviewer detail page.
- Wrapping mode: `serialize` for the single resource.
- Success status: `response.status(200)`.

## Authorization + segregation

Reads: authorization.md

- `apps/backend/app/policies/application_policy.ts`
  - `reviewQueue` remains the entry gate for reviewer-only surfaces.
- Query segregation:
  - reviewer detail read - restrict the application to the reviewer-visible queue.

## Test coverage gap

Backend tests already prove the reviewer detail payload exists. The gap is frontend coverage for the reviewer detail page: opening a queue item and rendering its history plus the current workflow state.
