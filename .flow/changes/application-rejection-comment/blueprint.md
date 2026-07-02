---
planned: 2026-07-02
---

# Application Rejection Comment — Implementation Plan

> Task type: greenfield
> Stack: AdonisJS API
> Database: PostgreSQL

## Summary

This change adds the reviewer rejection slice of the application workflow. An assigned reviewer can reject an application that is currently under review, but only with a non-empty comment, and the rejection is recorded as an atomic status transition plus audit log entry.

The plan keeps the workflow explicit around `Application`, uses a dedicated transition resource for rejection, and makes the rejection comment visible through the same detailed application response shape that future reviewer and applicant views can reuse.

## Target shape

A reviewer-only transition route rejects an `Application` through a dedicated service. The controller validates the comment, authorizes the current user against the loaded application, and delegates the transition to a transactional service that updates the application status to `REJECTED` and appends an audit log row with the reviewer, timestamp, and comment.

The application response uses a detailed transformer variant that includes the current status and the chronological audit trail, so the rejection comment is visible immediately on the updated resource and remains available to later application detail views.

## Logical schema

Reads: `models.md`, `model-relationships.md`, `migrations.md`, `schema-rules.md`

```dbml
Table applications {
  id integer [pk]
  applicant_user_id integer [not null, ref: > users.id]
  reviewer_user_id integer [null, ref: > users.id]
  status tinyint [not null, default: 0]
  created_at timestamp [not null]
  updated_at timestamp [not null]

  indexes {
    (applicant_user_id)
    (reviewer_user_id, status)
  }
}

Table application_audit_logs {
  id integer [pk]
  application_id integer [not null, ref: > applications.id]
  actor_user_id integer [not null, ref: > users.id]
  from_status tinyint [not null]
  to_status tinyint [not null]
  comment text [null]
  created_at timestamp [not null]

  indexes {
    (application_id, created_at)
    (actor_user_id)
  }
}
```

Application status is a backend-owned fixed option set backed by `app/values/application_status.ts` and stored as `tinyint`, not a database enum. Audit log rows are append-only; the plan intentionally keeps them timestamped for creation only.

## Migrations + models

Reads: `migrations.md`, `models.md`, `model-relationships.md`

`cd apps/backend && node ace make:model Application --migration --transformer`

`cd apps/backend && node ace make:model ApplicationAuditLog --migration --transformer`

Migration files (ordered):

- `apps/backend/database/migrations/<timestamp>_create_applications_table.ts` - generated with `Application`; creates the core application record with applicant ownership, reviewer assignment, and workflow status.
- `apps/backend/database/migrations/<timestamp>_create_application_audit_logs_table.ts` - generated with `ApplicationAuditLog`; creates the immutable audit trail for status transitions and rejection comments.

`cd apps/backend && node ace migration:run`

Model files:

- `apps/backend/app/models/application.ts` (new) - `Application` extends `ApplicationSchema`.
  - `@belongsTo(() => User, { foreignKey: 'applicantUserId' })` as `applicant` - links the owning applicant.
  - `@belongsTo(() => User, { foreignKey: 'reviewerUserId' })` as `reviewer` - links the currently assigned reviewer.
  - `@hasMany(() => ApplicationAuditLog, { onQuery: (query) => query.orderBy('created_at', 'asc') })` as `auditLogs` - keeps the visible workflow history chronological.
- `apps/backend/app/models/application_audit_log.ts` (new) - `ApplicationAuditLog` extends `ApplicationAuditLogSchema`.
  - `@belongsTo(() => Application)` as `application` - links each audit row back to the application.
  - `@belongsTo(() => User, { foreignKey: 'actorUserId' })` as `actor` - records who made the transition.

## Service design

Reads: `controllers.md`, `services.md`, `transactions.md`

`cd apps/backend && node ace make:service application_rejection`

- `apps/backend/app/services/application_rejection_service.ts` - `ApplicationRejectionService`.
  - `reject(applicationId: number, reviewerId: number, comment: string): Promise<Application>` - loads the application inside a managed transaction, locks the row, verifies it is still under review and still assigned to the same reviewer, updates the status to rejected, and writes the audit log entry with the required comment.
  - Does NOT: read HTTP input, authorize the caller, shape API responses, or decide route-level behavior.

## Validation

Reads: `validation.md`, `vine/types/string.md`

`cd apps/backend && node ace make:validator application_rejection`

### Input validation

```ts title="apps/backend/app/validators/application_rejection.ts"
import vine from '@vinejs/vine'

export const rejectApplicationValidator = vine.create({
  comment: vine.string().trim().minLength(1),
})
```

### Business rules

- The comment must be non-empty after trimming. Owner: validator.
- Assignment and workflow-state checks stay out of the validator because they depend on the loaded application. Owner: controller authorization branch and service transition guard.

## Authorization + segregation

Reads: `authentication.md`, `authorization.md`

`cd apps/backend && node ace make:policy application`

- `apps/backend/app/policies/application_policy.ts` - `ApplicationPolicy`.
  - `reject(user: User, application: Application)` - allows the transition only when the current user is the reviewer assigned to that application.

- Query segregation:
  - `Application.findOrFail(params.application_id)` on the rejection member route - the member lookup stays simple, and the policy is the entry-point gate for assignment.

## Controllers

Reads: `controllers.md`, `request.md`, `middleware.md`

`cd apps/backend && node ace make:controller application_rejections`

- `apps/backend/app/controllers/application_rejections_controller.ts` (new).
  - `store` - wiring: `auth`, `Application.findOrFail(params.application_id)`, `ApplicationPolicy.reject`, `rejectApplicationValidator`, `ApplicationRejectionService.reject`, `ApplicationTransformer` detailed variant, `serialize`.
    - authorize before validating the comment so assignment failures stay authorization failures
    - validate the comment before entering the service so only meaningful text reaches the transition layer
    - reload or receive the updated application with the audit trail preloaded before serializing
    - the action is a dedicated transition resource, not a generic status patch

- DI: method.

## Response layer

Reads: `transformers.md`, `response.md`, `exception-handling.md`

`cd apps/backend && node ace make:transformer application`

`cd apps/backend && node ace make:transformer application_audit_log`

- `apps/backend/app/transformers/application_transformer.ts` - `ApplicationTransformer`.
  - Fields needing transformation:
    - `status`:
      - `raw: number` - portable workflow status value.
      - `label: string` - backend-owned readable label for the current application state.
    - `auditLogEntries`:
      - `actor` - nested `UserTransformer` output for the reviewer who made each transition.
      - `fromStatus` / `toStatus` - transformed status objects so the history reads as workflow transitions, not raw numbers.
      - `comment` - pass-through text, shown when the transition required an explanation.
  - Pass-through fields: `id, createdAt, updatedAt`.
  - Relationships to preload before transform: `applicant`, `reviewer`, `auditLogs.actor`.
  - Runtime context required: none.
  - Variant: `forDetailedView()` adds `auditLogEntries` and is the shape the rejection action returns.
- `apps/backend/app/transformers/application_audit_log.ts` - `ApplicationAuditLogTransformer`.
  - Fields needing transformation:
    - `fromStatus` / `toStatus` - raw status values plus readable labels.
    - `actor` - nested `UserTransformer` output.
    - `comment` - pass-through text.
  - Pass-through fields: `id, createdAt`.
  - Relationships to preload before transform: `actor`.
  - Runtime context required: none.
- Wrapping mode: `serialize` (data object).
- Success status: `response.status(200)`.
- Recoverable errors:
  - Missing or blank comment - `422` + `serialize.withoutWrapping({ errors: [...] })` from the Vine validator.
- Self-handled exceptions thrown:
  - `ApplicationTransitionConflictException` - `409` conflict when the application is no longer under review.

`cd apps/backend && node ace make:exception application_transition_conflict`

## Routes

Reads: `routing.md`

```diff title="apps/backend/start/routes.ts"
 import { middleware } from '#start/kernel'
 import router from '@adonisjs/core/services/router'
 import { controllers } from '#generated/controllers'

 router.get('/', () => {
   return { hello: 'world' }
 })

 router
   .group(() => {
     router
       .group(() => {
         router.post('signup', [controllers.NewAccount, 'store'])
         router.post('login', [controllers.AccessTokens, 'store'])
       })
       .prefix('auth')
       .as('auth')

     router
       .group(() => {
         router.get('profile', [controllers.Profile, 'show'])
         router.post('logout', [controllers.AccessTokens, 'destroy'])
       })
       .prefix('account')
       .as('profile')
       .use(middleware.auth())

     router
       .resource('applications.rejections', controllers.ApplicationRejections)
       .only(['store'])
       .use(['store'], middleware.auth())
   })
   .prefix('/api/v1')
```

Verify route names with `cd apps/backend && node ace list:routes`.

## Events + side effects

Reads: none beyond the core workflow docs already used above.

None. The rejection transition stays fully synchronous and transaction-bound; it only updates application state and writes the audit trail.

## Test coverage gap

There are no application workflow tests on disk yet, so this change needs first-pass functional coverage for the rejection endpoint.

- Success path: assigned reviewer rejects an under-review application with a non-empty comment, receives the updated application resource, and the audit log row is written in the same transaction.
- Validation path: missing or blank comment returns a 422 validation error and does not create an audit log row.
- Authorization path: unassigned reviewer gets a denied response and the application stays unchanged.
- Conflict path: rejecting an application that is no longer under review throws the workflow conflict exception and leaves the application unchanged.
- Visibility path: the detailed application transformer includes the rejection comment and actor in the audit trail so later reviewer and applicant detail views can reuse the same response shape.
