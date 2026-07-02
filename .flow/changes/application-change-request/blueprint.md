---
planned: 2026-07-02
---

# Application Change Request — Implementation Plan

> Task type: capability change
> Stack: AdonisJS API
> Database: PostgreSQL

## Summary

Add the reviewer change-request transition around the shared `Application` record. The slice keeps the same application identity, records the transition in an audit trail, and rejects invalid transition attempts without mutating state.

## Current shape

- `apps/backend` currently has auth-only scaffolding: `User`, access-token and profile controllers, session-auth routes, and the default exception handler.
- No application workflow controllers, services, policies, validators, values, or audit-log tables exist yet in the repo.
- `apps/backend/start/routes.ts` only exposes `/api/v1/auth/*` and `/api/v1/account/*`.
- `apps/backend/config/database.ts` is configured for PostgreSQL.
- This plan assumes the shared `Application` aggregate from the earlier workflow slices already exists conceptually and adds transition behavior on top of it.

## Target shape

- Reviewer-facing change requests are an explicit transition endpoint on `Application`.
- Every successful transition writes the application status change and its audit log entry in the same database transaction.
- Change requests require a non-blank comment before any write occurs.
- Unauthorized actor attempts are rejected at the policy boundary; wrong-state attempts are rejected as workflow conflicts.
- Status values remain backend-owned string literals, not database enums.

## Invariants

- The same `Application` record survives the transition; no copy or replacement record is created.
- A successful transition always writes the application update and the audit log entry together.
- A reviewer can request changes only when acting on the assigned application.
- A change request requires a non-blank comment.
- Invalid attempts leave the application unchanged.
- API errors stay on the existing top-level `errors` envelope.

## Blast radius

- New status-values module, audit-log migration/model, workflow service, policy, validator, exception, transition controller, and route entry.
- Existing auth middleware and session-based API contract stay in place.
- No notifications, queues, search, or attachment changes.

## Logical schema

Reads: migrations.md, models.md, model-relationships.md, schema-rules.md

```dbml
Table application_audit_entries {
  id integer [pk, increment]
  application_id integer [not null, ref: > applications.id]
  actor_id integer [not null, ref: > users.id]
  from_status varchar [not null]
  to_status varchar [not null]
  comment text [not null]
  created_at timestamp [not null]

  indexes {
    (application_id, created_at) [name: 'application_audit_entries_application_created_at_index']
  }
}
```

The shared `applications` table keeps its existing status and ownership columns; this slice reads those columns but does not introduce a database enum. `application_audit_entries` is append-only and records status transitions only.

## Migrations + models

Reads: migrations.md, models.md, model-relationships.md, transactions.md

`cd <monorepo-app> && node ace make:migration application_audit_entries --create=application_audit_entries`

Migration files (ordered):

- `<monorepo-app>/database/migrations/<timestamp>_create_application_audit_entries_table.ts` — create the append-only audit trail with application/user foreign keys, from/to status strings, a required comment, and `created_at` only.

`cd <monorepo-app> && node ace make:model ApplicationAuditEntry`

Model files:

- `<monorepo-app>/app/models/application_audit_entry.ts` (new) — `ApplicationAuditEntry` extends the generated `ApplicationAuditEntrySchema`.
  - `@belongsTo(() => Application)` — application row the audit entry belongs to.
  - `@belongsTo(() => User, { foreignKey: 'actorId' })` — user who performed the transition.

- `<monorepo-app>/app/values/application_status.ts` (new) — exported backend-owned string literals for `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, and `REJECTED`; shared by schema checks, service branches, and policy decisions.

`cd <monorepo-app> && node ace migration:run`

## Service design

Reads: services.md, transactions.md, model-relationships.md

`cd <monorepo-app> && node ace make:service application_workflow`

- `<monorepo-app>/app/services/application_workflow_service.ts` — `ApplicationWorkflowService`.
  - `requestChange(application: Application, reviewer: User, comment: string): Promise<Application>` — lock the application row in a transaction, verify it is under review, write the audit entry, update status to `CHANGES_REQUESTED`, and return the updated application.
  - Uses a shared transactional helper to re-read the application with `forUpdate()` before mutating it.
  - Does NOT: read request or response objects, perform serialization, or own authorization decisions.

## Validation

Reads: validation.md, vine/types/string.md

`cd <monorepo-app> && node ace make:validator application`

### Input validation

```ts title="<monorepo-app>/app/validators/application.ts"
import vine from '@vinejs/vine'

export const requestApplicationChangeValidator = vine.create({
  comment: vine.string().trim().minLength(1).maxLength(2000),
})
```

### Business rules

- The change-request comment must be non-blank after trimming. Owner: validator.
- Wrong-state transitions are not validation failures; they are workflow conflicts. Owner: service.

## Authorization + segregation

Reads: authentication.md, authorization.md

`cd <monorepo-app> && node ace make:policy application`

- `<monorepo-app>/app/policies/application_policy.ts` — `ApplicationPolicy`.
  - `requestChange(user: User, application: Application)` — allow only the assigned reviewer to act on this application.

- Query segregation:
  - `Application.query().where('id', params.id)` in the controller; the row is fetched once for authorization and then re-read under lock inside the service.

## Controllers

Reads: controllers.md, request.md, authentication.md, response.md, authorization.md

`cd <monorepo-app> && node ace make:controller application_change_requests`

- `<monorepo-app>/app/controllers/application_change_requests_controller.ts` (new).
  - `store` — wiring: `requestApplicationChangeValidator`, `ApplicationPolicy.requestChange`, `ApplicationWorkflowService.requestChange`, `serialize.withoutWrapping`.
    - Validate before authorization so the required comment failure is surfaced as a request error.
    - Load the application by `params.id`, authorize the assigned reviewer, then hand the model plus the validated comment to the service.
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
  - Missing or blank change-request comment — 422 validation envelope from `request.validateUsing(...)`.
- Unrecoverable errors:
  - Unauthorized reviewer — 403 from `ApplicationPolicy`.
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
+          .post('applications/:id/change-request', [controllers.ApplicationChangeRequests, 'store'])
+          .where('id', router.matchers.number())
+      })
+      .prefix('reviewer')
+      .as('reviewer')
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

There are no application workflow tests in the repo yet. The later assert plan should cover the reviewer happy path, blank-comment validation, unauthorized reviewer rejection, wrong-state conflict rejection, and a transaction assertion that the status change and audit entry land together.
