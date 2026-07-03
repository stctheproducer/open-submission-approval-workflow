---
planned: 2026-07-03
built: 2026-07-03
---

# Reviewer Queue Status Filtering — Implementation Plan

> Task type: extension
> Stack: AdonisJS API + React/Vite frontend
> Database: PostgreSQL

## Summary

The reviewer queue already supports queue scoping. This slice adds a simple status filter in the reviewer workspace so reviewers can narrow the queue without adding search or broader queue tooling.

## Pre-implementation requirements

_None._

## Out of scope

- Search, saved views, bulk actions, and any richer queue tooling.

## Current shape

- Backend already supports a reviewer queue validator and queue scope that distinguish ready work from owned work.
- The frontend has no reviewer queue UI yet, so there is no filter control to wire.
- Queue pagination already exists in the backend response.

## Target shape

The reviewer can narrow the queue to one workflow state at a time, clear the filter, and keep the same paginated queue behavior.

## Validation

Reads: validation.md

### Input validation

- The filter choice is limited to the queue states the product actually exposes. Owner: validator file.

### Business rules

- The filtered queue must stay paginated and ordered the same way as the unfiltered queue. Owner: query layer.

## Controllers

Reads: controllers.md

- `apps/backend/app/controllers/reviewer_applications_controller.ts` (modified).
  - `index` - accept the queue filter and pass it into the queue scope.

## Response layer

Reads: transformers.md, response.md

- `apps/backend/app/transformers/application_transformer.ts` - no new shape required; the queue rows continue to serialize through the existing transformer.
- Wrapping mode: `serialize` for the paginated collection.

## Authorization + segregation

Reads: authorization.md

- `apps/backend/app/policies/application_policy.ts`
  - `reviewQueue` still gates the whole queue surface.
- Query segregation:
  - reviewer queue read - restrict to reviewer-visible work, then apply the selected queue state.

## Test coverage gap

Backend tests already cover the unfiltered reviewer queue. The gap is frontend coverage for the filter control and the backend assertion that the selected queue state narrows the same paginated response.
