---
planned: 2026-07-02
built: 2026-07-02
---

# Application Draft Reopening — Implementation Plan

> Task type: capability change
> Stack: AdonisJS API
> Database: PostgreSQL

## Summary

Add the applicant draft-reopen transition around the shared `Application` record. The slice keeps the same application identity, records the transition in an audit trail, and rejects invalid transition attempts without mutating state.

## Current shape

- `apps/backend` currently has auth-only scaffolding: `User`, access-token and profile controllers, session-auth routes, and the default exception handler.
- No application workflow controllers, services, policies, validators, values, or audit-log tables exist yet in the repo.
- `apps/backend/start/routes.ts` only exposes `/api/v1/auth/*` and `/api/v1/account/*`.
- `apps/backend/config/database.ts` is configured for PostgreSQL.
- This plan assumes the shared `Application` aggregate from the earlier workflow slices already exists conceptually and adds transition behavior on top of it.

## Target shape

- Applicant-facing draft reopenings are an explicit transition endpoint on `Application`.
- Every successful transition writes the application status change and its audit log entry in the same database transaction.
- Reopen requests require the application to have been returned for changes before any write occurs.
- Unauthorized actor attempts are rejected at the policy boundary; wrong-state attempts are rejected as workflow conflicts.
- Status values remain backend-owned string literals, not database enums.

## Invariants

- The same `Application` record survives the transition; no copy or replacement record is created.
- A successful transition always writes the application update and the audit log entry together.
- An applicant can reopen only their own application.
- Reopening is allowed only after a change request has been made.
- Invalid attempts leave the application unchanged.
- API errors stay on the existing top-level `errors` envelope.

## Blast radius

- New workflow service, policy, exception, transition controller, and route entry.
- Existing auth middleware and session-based API contract stay in place.
- No notifications, queues, search, or attachment changes.

## Logical schema

Reads: migrations.md, models.md, model-relationships.md, schema-rules.md

_n/a_

## Migrations + models

Reads: migrations.md, models.md, model-relationships.md, transactions.md

_n/a_

## Service design

Reads: services.md, transactions.md, model-relationships.md

`cd <monorepo-app> && node ace make:service application_workflow`

- `<monorepo-app>/app/services/application_workflow_service.ts` — `ApplicationWorkflowService`.
  - `reopenDraft(application: Application, applicant: User): Promise<Application>` — lock the application row in a transaction, verify it is `CHANGES_REQUESTED`, write the audit entry, update status to `DRAFT`, and return the updated application.
  - Uses a shared transactional helper to re-read the application with `forUpdate()` before mutating it.
  - Does NOT: read request or response objects, perform serialization, or own authorization decisions.

## Validation

Reads: validation.md, vine/types/string.md

_n/a (no request-body shape changes)_

## Authorization + segregation

Reads: authentication.md, authorization.md

`cd <monorepo-app> && node ace make:policy application`

- `<monorepo-app>/app/policies/application_policy.ts` — `ApplicationPolicy`.
  - `reopenDraft(user: User, application: Application)` — allow only the owning applicant to act on this application.

- Query segregation:
  - `Application.query().where('id', params.id)` in the controller; the row is fetched once for authorization and then re-read under lock inside the service.

## Controllers

Reads: controllers.md, request.md, authentication.md, response.md, authorization.md

`cd <monorepo-app> && node ace make:controller application_draft_reopenings`

- `<monorepo-app>/app/controllers/application_draft_reopenings_controller.ts` (new).
  - `store` — wiring: `ApplicationPolicy.reopenDraft`, `ApplicationWorkflowService.reopenDraft`, `serialize.withoutWrapping`.
    - Load the application by `params.id`, authorize the owning applicant, then hand the model to the service.
    - Return the updated application summary as an unwrapped action payload.
    - Non-default path: the transition is multi-step and atomic, so the controller delegates mutation to the service instead of updating the model inline.

- DI: method injection for `ApplicationWorkflowService`.
- Per-action middleware overrides: none beyond route-group `auth()`.

## Response layer

Reads: response.md, exception-handling.md

- No new transformer file. The transition response stays as a plain unwrapped action payload.
- `cd <monorepo-app> && node ace make:exception application_transition_conflict`
- Success status: `response.status(200)`.
- Success payload shape: `serialize.withoutWrapping({ application: { id, status, updatedAt } })`.
- Recoverable errors:
  - None beyond standard auth/session handling.
- Unrecoverable errors:
  - Unauthorized applicant — 403 from `ApplicationPolicy`.
  - Wrong application state for the requested transition — `ApplicationTransitionConflictException` with status 409 and the standard `{ errors: [{ message }] }` envelope.
- `ApplicationTransitionConflictException` lives at `<monorepo-app>/app/exceptions/application_transition_conflict_exception.ts` and is thrown by the service when the current application state does not allow the requested transition.

## Routes

Reads: routing.md

```diff title="<monorepo-app>/start/routes.ts"
@@
     router
       .group(() => {
         router.get('profile', [controllers.Profile, 'show'])
         router.post('logout', [controllers.AccessTokens, 'destroy'])
       })
       .prefix('account')
       .as('profile')
       .use(middleware.auth())

+    router
+      .group(() => {
+        router
+          .post('applications/:id/reopen', [controllers.ApplicationDraftReopenings, 'store'])
+          .where('id', router.matchers.number())
+      })
+      .prefix('applicant')
+      .as('applicant')
+      .use(middleware.auth())
   })
   .prefix('/api/v1')
```

Verify route names with `cd <monorepo-app> && node ace list:routes`.

## Events + side effects

Reads: _n/a (no event or listener work is introduced)

_None._

## Test coverage gap

Reads: testing.md

There are no application workflow tests in the repo yet. The later assert plan should cover the applicant happy path, wrong-state conflict rejection, unauthorized applicant rejection, and a transaction assertion that the status change and audit entry land together.
