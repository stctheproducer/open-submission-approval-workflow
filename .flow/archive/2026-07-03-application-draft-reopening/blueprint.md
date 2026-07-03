# Application Draft Reopening — Blueprint

> Stack: AdonisJS API
> Source: `.flow/changes/application-draft-reopening/brief.md`
> Date: 2026-07-03
> Built: 2026-07-03

## Summary

`Reads: controllers.md, response.md, authentication.md, authorization.md, transactions.md, testing.md`

Applicants can reopen an owned requested-changes application back to draft on the same record. The reopening keeps the existing application history behavior and uses the current controller/service split.

## Pre-implementation requirements

None.

## Controller layout

`Reads: controllers.md, response.md`

- `apps/backend/app/controllers/application_draft_reopenings_controller.ts` — modified
  - `store` remains the explicit reopen action for an applicant-owned application.
  - The controller keeps returning the updated application summary shape used by the reopening journey.

## Service design

`Reads: services.md, transactions.md`

- `apps/backend/app/services/application_workflow_service.ts` — modified
  - `reopenDraft(application, applicant)` remains the atomic transition path.
  - The method updates the application status to draft and writes the corresponding audit entry in the same transaction.
  - The method reloads the application with the detail/history relations used by the current read journey.

## Validation rules

None.

## Authz + segregation

`Reads: authentication.md, authorization.md`

- `apps/backend/app/policies/application_policy.ts` remains the ownership gate for `reopenDraft`.
- `apps/backend/start/routes.ts` keeps the reopen route inside the authenticated applicant route group.
- The controller continues to load the target application and authorize against the applicant-owned record before reopening.

## Controllers

`Reads: controllers.md, response.md`

- `apps/backend/app/controllers/application_draft_reopenings_controller.ts` — modified
  - `store`
    - Resolves the application by id.
    - Authorizes the applicant against the application policy before changing state.
    - Calls the workflow service to reopen the record.
    - Returns the updated summary payload with wrapped/unwrapped shape matching the existing route contract.

## Response layer

`Reads: response.md`

- The action returns the existing unwrapped summary payload.
- The response keeps exposing the reopened application's id, status, and updated timestamp.

## Routes

`Reads: controllers.md`

- `apps/backend/start/routes.ts` — no change
  - Keeps the existing applicant reopen route.

## Events + side effects

`Reads: transactions.md`

- The status transition and audit entry remain atomic.
- The history write remains inside the same transaction as the reopen state change.

## Testing

`Reads: testing.md`

- `apps/backend/tests/functional/applications/draft_reopenings.spec.ts` — keep and possibly refine
  - Existing coverage already proves the eligible reopen, unauthenticated rejection, non-owner rejection, non-eligible conflict, and 404 case.

## Out of scope

- Resubmission history semantics.
- Frontend wiring.
