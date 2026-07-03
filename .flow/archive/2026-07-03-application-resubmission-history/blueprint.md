# Application Resubmission History — Blueprint

> Stack: AdonisJS API
> Source: `.flow/changes/application-resubmission-history/brief.md`
> Date: 2026-07-03
> Built: 2026-07-03

## Summary

`Reads: controllers.md, response.md, authentication.md, authorization.md, transactions.md, testing.md`

Reopened applications reuse the existing submission route and service, but the user-facing contract must clearly show the second submission as a distinct history event on the same record. The implementation stays on the current submission flow; the slice is primarily a contract and test refinement.

## Pre-implementation requirements

None.

## Controller layout

`Reads: controllers.md, response.md`

- `apps/backend/app/controllers/application_submissions_controller.ts` — modified
  - `store` remains the applicant submission action for draft applications, including reopened drafts.
  - The controller continues returning the detailed application payload produced by the submission service.

## Service design

`Reads: services.md, transactions.md`

- `apps/backend/app/services/application_submission_service.ts` — modified
  - `submit(application, actor)` remains the atomic submission path.
  - A reopened draft submission uses the same transaction and writes a new submission transition plus audit log entry on the same application record.
  - Failed submissions continue to leave the application unchanged and do not append a new history event.

## Validation rules

None.

## Authz + segregation

`Reads: authentication.md, authorization.md`

- `apps/backend/start/routes.ts` keeps the submission route inside the authenticated applicant route group.
- `apps/backend/app/controllers/application_submissions_controller.ts` keeps the ownership-aware draft lookup before submission.

## Controllers

`Reads: controllers.md, response.md`

- `apps/backend/app/controllers/application_submissions_controller.ts` — modified
  - `store`
    - Resolves the owned draft application.
    - Calls the submission service.
    - Returns the detailed application payload so the revised history remains visible.

## Response layer

`Reads: response.md, transformers.md`

- `apps/backend/app/transformers/application_transformer.ts` — already covers the detailed history payload and requires no new shape.
- The response stays wrapped under `{ data: ... }` for the detailed application body.

## Routes

`Reads: controllers.md`

- `apps/backend/start/routes.ts` — no change
  - Keeps the existing applicant submission route.

## Events + side effects

`Reads: transactions.md`

- The submission status change, status transition, and audit log entry remain atomic.
- A failed reopened submission must not add a new transition or audit log row.

## Testing

`Reads: testing.md`

- `apps/backend/tests/functional/applications/submissions.spec.ts` — change
  - Existing submission coverage stays in place.
  - Add a reopened-draft resubmission case that proves the second submission appears as a distinct revision-round history event on the same application.
  - Keep the unauthenticated, foreign/non-existent, and non-draft conflict coverage.

## Out of scope

- Draft reopening itself.
- Frontend wiring.
- Any new database schema.
