---
planned: 2026-07-03
built: 2026-07-03
---

# Reviewer Queue Start — Implementation Plan

> Task type: extension
> Stack: AdonisJS API + React/Vite frontend
> Database: PostgreSQL

## Summary

The reviewer workspace already has backend queue and review-start support. This slice finishes the reviewer entry experience by wiring the queue and start-review flow into the reviewer-facing frontend, then tightening the backend tests around the queue shape and ownership transition.

## Pre-implementation requirements

_None._

## Out of scope

- Search and richer queue tooling. The change stays focused on the queue the reviewer already uses.

## Current shape

- Backend already exposes a reviewer queue endpoint, a review-start action, and a reviewer-focused application transformer.
- The frontend has applicant pages and reviewer role gating, but the reviewer area is still a placeholder.
- Existing API tests already cover the queue and start-review backend flow.

## Target shape

The reviewer lands in a real workspace, sees actionable work, and can start review from that surface without leaving the queue context.

## Routes

Reads: routing.md

```diff title="<monorepo-app>/start/routes.ts"
@@
       router
         .group(() => {
           router.resource('applications', controllers.ReviewerApplications).only(['index', 'show'])
           router.post('applications/:id/review-starts', [
             controllers.ApplicationReviewStarts,
             'store',
           ])
@@
```

Verify route names with `cd <monorepo-app> && node ace list:routes`.

## Controllers

Reads: controllers.md

- `apps/backend/app/controllers/reviewer_applications_controller.ts` (modified).
  - `index` - keep the queue response paginated and reviewer-scoped.
  - `show` - keep the reviewer detail response available for the entry flow.
- `apps/backend/app/controllers/application_review_starts_controller.ts` (modified if needed for response shape only).
  - `store` - trigger the ownership transition for the current reviewer.

## Response layer

Reads: transformers.md, response.md

- `apps/backend/app/transformers/application_transformer.ts` - keep the reviewer-visible fields and detail variant aligned with the queue and start-review flow.
- Wrapping mode: `serialize` for collection/detail resources.
- Success status: `response.status(200)`.
- Self-handled exceptions thrown: existing conflict / authorization exceptions already used by the review-start path.

## Validation

Reads: validation.md

### Input validation

`_n/a_`

### Business rules

- A reviewer can only start review when the application is still eligible. Owner: service layer.
- The queue includes submitted work and the signed-in reviewer’s owned in-review work. Owner: query scope.

## Authorization + segregation

Reads: authorization.md

- `apps/backend/app/policies/application_policy.ts` - keep `reviewQueue` gating reviewer access and `approve`/`requestChange`/`reject` assignment checks separate.
- Query segregation:
  - reviewer queue read - scope by reviewer role plus queue eligibility.

## Test coverage gap

Backend tests already cover the queue and review-start paths. The gap is the reviewer-facing frontend journey: landing in the reviewer area, seeing queue entries, and starting review from the workspace.
