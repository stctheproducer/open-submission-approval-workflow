---
planned: 2026-07-02
---

# Workflow Conflicts — Implementation Plan

> Task type: modification
> Stack: AdonisJS API
> Database: PostgreSQL

## Summary

This change hardens the existing application workflow so stale transition attempts fail as the same 409 conflict across every main workflow route. The implementation keeps the current transition resources and atomic write model intact; it centralizes the stale-state check in the transition services and lets the global API error flow render one consistent conflict envelope.

## Pre-implementation requirements

_n/a_

## Out of scope

_n/a_

## Current shape

- The backend currently has only the starter auth/account surfaces plus the default exception handler.
- There are no `Application` workflow controllers, services, models, validators, or audit-log tables in the current checkout yet.
- The repo already documents the intended workflow vocabulary and the explicit transition-resource architecture in `CONTEXT.md` and `docs/adr/0002-explicit-transition-resources-for-application-workflow.md`.
- The existing change blueprints for the workflow slices show the expected naming convention for the transition services and conflict exception, but those files are not present in `apps/backend` yet.
- `apps/backend/tests` only contains the bootstrap file, so workflow conflict coverage still needs to be added from scratch.

## Target shape

Every established application transition route rejects stale actions the same way: the application stays unchanged, no audit row is written, and the client receives a standard 409 API error envelope with a workflow-conflict message. Valid transitions continue to succeed with their existing payloads. Retrying the same invalid action without a state change produces the same conflict response again.

## Logical schema

Reads: _n/a (no schema changes)_

_n/a_

## Migrations + models

Reads: _n/a (no schema changes)_

_n/a_

## Service design

Reads: `controllers.md`, `services.md`, `transactions.md`

- `<monorepo-app>/app/services/application_submission_service.ts` — `ApplicationSubmissionService` (modified).
  - `submit(application: Application, actor: User): Promise<void>` — recheck the application inside the transaction before moving it out of `DRAFT`; throw `ApplicationTransitionConflictException` if the row is no longer eligible.
  - Does NOT: change authorization, shape responses, or special-case the route surface.
- `<monorepo-app>/app/services/application_review_start_service.ts` — `ApplicationReviewStartService` (modified).
  - `start(applicationId: number, reviewer: User): Promise<Application>` — lock and re-read the application before assigning review ownership; stale retries against a non-`SUBMITTED` record throw the same conflict exception.
  - Does NOT: own policy checks or response shaping.
- `<monorepo-app>/app/services/application_approval_service.ts` — `ApplicationApprovalService` (modified).
  - `approve(application: Application, reviewer: User): Promise<Application>` — verify the row is still `UNDER_REVIEW` inside the transaction before writing the approval transition.
  - Does NOT: decide route authorization or serialize the response.
- `<monorepo-app>/app/services/application_rejection_service.ts` — `ApplicationRejectionService` (modified).
  - `reject(application: Application, reviewer: User, comment: string): Promise<Application>` — keep the comment workflow intact, but reject stale state with the shared conflict exception before mutating.
  - Does NOT: validate the comment beyond the existing validator or own authz.
- `<monorepo-app>/app/services/application_workflow_service.ts` — `ApplicationWorkflowService` (modified).
  - `requestChange(application: Application, reviewer: User, comment: string): Promise<Application>` — reject stale non-`UNDER_REVIEW` rows with the shared conflict exception.
  - `reopenDraft(application: Application, applicant: User): Promise<Application>` — reject stale non-`CHANGES_REQUESTED` rows with the shared conflict exception.
  - Does NOT: own HTTP concerns, route names, or response envelopes.

The common rule across all of these services is the same: acquire the current row inside the transaction, compare the live workflow state to the transition precondition, and throw `ApplicationTransitionConflictException` when the requested action is no longer legal.

## Validation

Reads: `validation.md`

_n/a (no request-body shape changes)_

## Authorization + segregation

Reads: `authentication.md`, `authorization.md`

_n/a (no policy or segregation changes; existing ownership and reviewer checks stay where they are)_

## Controllers

Reads: `controllers.md`, `exception-handling.md`

_n/a (the transition controllers stay structurally the same; they continue to delegate to their services and let the shared conflict exception bubble to the global handler)_

## Response layer

Reads: `exception-handling.md`

`cd <monorepo-app> && node ace make:exception application_transition_conflict`

- `<monorepo-app>/app/exceptions/application_transition_conflict_exception.ts` — `ApplicationTransitionConflictException`.
  - `static status = 409` and a stable application-workflow conflict code.
  - No custom `handle()` method; the global handler should keep the standard `{ errors: [{ message }] }` API envelope.
- `<monorepo-app>/app/exceptions/handler.ts` — modified.
  - Add the conflict status to the expected-client-error ignore list if the app is filtering those statuses from reports.
  - Keep the default `super.handle(error, ctx)` path so validation, authorization, not-found, and workflow-conflict failures all negotiate to the same top-level error contract.

Success responses are unchanged by this slice; only the error contract for stale workflow actions is being standardized.

Recoverable errors:

- Existing validation failures still return 422 through the current API envelope.

Self-handled exceptions thrown:

- `ApplicationTransitionConflictException` — 409 conflict for stale workflow transitions.

## Routes

Reads: `routing.md`

_n/a (route surface unchanged; this slice reuses the existing workflow transition routes)_

## Events + side effects

Reads: _n/a (no events or listeners)_

_n/a_

## Test coverage gap

There are no workflow conflict tests in the current repo. Add functional coverage that exercises the established transition routes in both valid and stale-state paths:

- One parameterized conflict spec that covers submission, review start, approval, rejection, change request, and draft reopen.
- For each route, force the application into the wrong state, retry the same action, and assert `409`, the top-level `errors` envelope, no application-state change, and no new audit-log row.
- Add a control case for each route that still succeeds when the application is in the expected state, so the new guard does not break legitimate transitions.
- Add one contract assertion that the new conflict response matches the same overall API envelope already used by validation, authorization, and not-found failures.

