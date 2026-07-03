---
planned: 2026-07-03
built: 2026-07-03
---

# Resubmitted Reviewer Queue — Implementation Plan

> Task type: modification
> Stack: AdonisJS API
> Database: PostgreSQL (SQLite in tests)

## Summary

Clear stale reviewer assignment when a review cycle ends or when an applicant resubmits, so resubmitted `submitted` applications match the existing ready-queue scope (`assignedReviewerId` is null).

## Pre-implementation requirements

_None._

## Out of scope

- Changing `Application.reviewQueue` scope rules.
- New routes, controllers, validators, or transformers.
- Frontend changes (queue UI already lists API results).

## Current shape

Reads: services.md, models.md

- `Application.reviewQueue` includes ready work only when `status = submitted` AND `assignedReviewerId IS NULL`.
- `ApplicationWorkflowService.requestChange` moves `under_review` → `changes_requested` but leaves `assignedReviewerId` set.
- `ApplicationSubmissionService.submit` moves `draft` → `submitted` but leaves `assignedReviewerId` set.
- After change request → reopen → resubmit, the record is `submitted` with a stale assignee and is invisible in the queue.

## Target shape

Reads: services.md, transactions.md

- When a reviewer requests changes, the application clears `assignedReviewerId` in the same transaction as the status transition.
- When an applicant submits a draft, the application clears `assignedReviewerId` in the same transaction as the status transition.
- No schema migration required.

## Logical schema

Reads: models.md

_n/a (task type: schema untouched)_

## Migrations + models

Reads: migrations.md, models.md

_n/a (task type: schema untouched)_

## Service design

Reads: services.md, transactions.md

- `apps/backend/app/services/application_workflow_service.ts` — `ApplicationWorkflowService` (modified).
  - `requestChange(application, reviewer, comment)` — after validating `under_review`, set `assignedReviewerId = null` before save so the ended review cycle does not carry ownership forward.
  - Does NOT: alter queue scope, authorization, or audit semantics beyond clearing assignee.

- `apps/backend/app/services/application_submission_service.ts` — `ApplicationSubmissionService` (modified).
  - `submit(application, actor)` — when moving `draft` → `submitted`, set `assignedReviewerId = null` before save so resubmissions re-enter the shared ready pool.
  - Does NOT: change submission validation, history shape, or non-draft submission rules.

## Validation

Reads: validation.md

_n/a (task type: no input changes)_

## Authorization + segregation

Reads: authentication.md, authorization.md

- No policy or route changes. Existing `reviewQueue` and `reviewStart` authorization unchanged.
- Query segregation unchanged — ready work remains `submitted` + unassigned.

## Controllers

Reads: controllers.md

_n/a (task type: no controller changes)_

## Response layer

Reads: transformers.md, response.md

_n/a (task type: no response shape changes)_

## Routes

Reads: routing.md

_n/a (task type: no route changes)_

## Events + side effects

Reads: controllers.md

- No new events or listeners.
- Existing audit log and status-transition writes remain in the same transactions.

## Test coverage gap

Functional tests in `tests/functional/applications/reviewer.spec.ts` cover queue listing and review start but not the resubmission re-queue path. Add an end-to-end functional test for change request → reopen → resubmit → reviewer queue visibility and review start.

---
