---
planned: 2026-07-02
built: 2026-07-02
---

# Reviewer Queue Start — Implementation Plan

> Task type: greenfield
> Stack: AdonisJS API
> Database: PostgreSQL

## Summary

Build the reviewer-facing entry point for the application workflow: a queue that shows ready work and already-owned work, an application detail view, and an explicit start-review transition that claims an application for the current reviewer.

This slice introduces the reviewer-only workspace contract, the application review ownership fields, and the atomic status-transition path that writes the audit log in the same transaction as the assignment.

## Current shape

Reads: `CONTEXT.md`, `docs/adr/0001-same-origin-session-auth-on-sevalla.md`, `docs/adr/0002-explicit-transition-resources-for-application-workflow.md`

- Backend routes currently cover auth signup/login plus the authenticated profile/logout endpoints.
- The backend has `User` auth scaffolding, but no Application domain tables, models, controllers, policies, services, or transformers yet.
- The frontend is still the starter Vite shell and does not yet have a reviewer workspace.

## Out of scope

- Applicant draft creation/editing and submission flows. Those are separate workflow slices.
- Reviewer approval, rejection, and change-request transitions. This change only starts review.
- Attachment versioning, search, notifications, and other post-core enhancements.
- Frontend polish beyond wiring the reviewer queue and detail screens to the new API.

## Target shape

The reviewer signs in, opens a single queue, and can switch between ready work and work already assigned to them. From that queue they can open a specific application, inspect the details that matter for review, and start review with an explicit transition endpoint.

Starting review claims the application for the current reviewer, moves it from `SUBMITTED` to `UNDER_REVIEW`, and writes a matching audit-log row in one database transaction. Invalid transition attempts fail cleanly and leave the record unchanged.

## Logical schema

Reads: `models.md`, `model-relationships.md`, `migrations.md`, `schema-rules.md`

```dbml
Table users {
  id int [pk]
  full_name varchar
  email varchar [not null, unique]
  password varchar [not null]
  role varchar [not null, default: 'applicant']
  created_at timestamp [not null]
  updated_at timestamp

  indexes {
    (role) [name: 'users_role_index']
  }
}

Table applications {
  id int [pk]
  applicant_user_id int [not null, ref: > users.id]
  assigned_reviewer_id int [ref: > users.id]
  title varchar [not null]
  category varchar [not null]
  description text [not null]
  amount decimal [not null]
  status varchar [not null]
  created_at timestamp [not null]
  updated_at timestamp

  indexes {
    (applicant_user_id) [name: 'applications_applicant_user_id_index']
    (assigned_reviewer_id) [name: 'applications_assigned_reviewer_id_index']
    (status) [name: 'applications_status_index']
    (status, assigned_reviewer_id, updated_at) [name: 'applications_queue_index']
  }
}

Table application_audit_logs {
  id int [pk]
  application_id int [not null, ref: > applications.id]
  actor_user_id int [not null, ref: > users.id]
  from_status varchar [not null]
  to_status varchar [not null]
  comment text
  created_at timestamp [not null]

  indexes {
    (application_id, created_at) [name: 'application_audit_logs_application_created_at_index']
  }
}
```

Status and role values stay as backend-owned string sets, not database enums. The schema only records portable strings; the allowed values live in application code and API responses.

`assigned_reviewer_id` is nullable until review starts. `application_audit_logs` is append-only and records workflow transitions only, not draft edits.

## Migrations + models

Reads: `migrations.md`, `models.md`

`cd <monorepo-app> && node ace make:model Application --migration --transformer --factory`

`cd <monorepo-app> && node ace make:model ApplicationAuditLog --migration`

Migration files (ordered):

- `<monorepo-app>/database/migrations/<timestamp>_add_role_to_users_table.ts` - add the reviewer/applicant role column to `users` and seed the default applicant role.
- `<monorepo-app>/database/migrations/<timestamp>_create_applications_table.ts` - create the core application record with applicant ownership, reviewer assignment, workflow status, and timestamps.
- `<monorepo-app>/database/migrations/<timestamp>_create_application_audit_logs_table.ts` - create immutable workflow history rows for status transitions.

`cd <monorepo-app> && node ace migration:run`

Model files:

- `<monorepo-app>/app/models/application.ts` (new) - `Application` extends the generated `ApplicationSchema`.
  - `@belongsTo(() => User, { foreignKey: 'applicantUserId' })` `applicant` - applicant ownership relation.
  - `@belongsTo(() => User, { foreignKey: 'assignedReviewerId' })` `assignedReviewer` - reviewer assignment relation.
  - `@hasMany(() => ApplicationAuditLog)` `auditLogs` - workflow history relation.
  - `isReadyForReview()` - single-entity guard for `SUBMITTED` records with no assigned reviewer.
  - `reviewState` accessor - derives `ready`, `owned`, or `other` for queue display.
  - `reviewQueue` scope - narrows reads to the reviewer workspace and applies the optional `reviewState` filter.
- `<monorepo-app>/app/models/application_audit_log.ts` (new) - `ApplicationAuditLog` extends the generated `ApplicationAuditLogSchema`.
  - `@belongsTo(() => Application)` `application` - parent application relation.
  - `@belongsTo(() => User, { foreignKey: 'actorUserId' })` `actor` - reviewer who made the transition.
- `<monorepo-app>/app/models/user.ts` (modified) - `User` extends the existing `UserSchema`.
  - `@hasMany(() => Application, { foreignKey: 'applicantUserId' })` `applications` - applications created by the user as applicant.
  - `@hasMany(() => Application, { foreignKey: 'assignedReviewerId' })` `reviewAssignments` - applications currently assigned to the user as reviewer.
  - `isReviewer` accessor - derived from `role` for workspace gating.

## Service design

Reads: `controllers.md`, `services.md`, `transactions.md`

- `<monorepo-app>/app/services/application_review_start_service.ts` - `ApplicationReviewStartService`.
  - `start(applicationId: number, reviewer: User): Promise<Application>` - lock the application, confirm it is still eligible for review start, assign the reviewer, write the audit log, and return the updated model.
  - Does NOT: authorize the caller, parse HTTP input, choose queue filters, or shape API responses.

## Validation

Reads: `validation.md`

_n/a: this slice does not introduce request-body validation. Route params use route matchers, and the queue filter is a controller-level whitelist rather than a body payload._

Business rules not expressed in validators:

- `reviewState` only accepts the backend-owned queue states `ready` and `owned`. Owner: controller branch.
- Review start is eligible only when the application is still `SUBMITTED` and has no assigned reviewer. Owner: `ApplicationReviewStartService.start()`.
- The audit-log actor is always the authenticated reviewer. Owner: controller-to-service input.

## Authorization + segregation

Reads: `authentication.md`, `authorization.md`

- `<monorepo-app>/app/abilities/main.ts` - `accessReviewerWorkspace(user: User)`.
  - Reviewer-role gate for the entire reviewer workspace.
- Permission / role keys:
  - `users.role = 'applicant'`
  - `users.role = 'reviewer'`

- Query segregation:
  - `ReviewerApplicationsController.index` - `Application.query().withScopes((scopes) => scopes.reviewQueue(reviewerId, reviewState))` with `applicant` and `assignedReviewer` preloaded.
  - `ReviewerApplicationsController.show` - same reviewer-queue scope plus `whereKey(params.id)` so inaccessible records return 404 instead of leaking.
  - `ApplicationReviewStartService.start` - direct `findOrFail` plus the service-level eligibility guard after row locking; the transition conflict, not a missing-row error, is what distinguishes an illegal start-review attempt.

## Controllers

Reads: `controllers.md`, `http-context.md`, `request.md`, `middleware.md`, `model-relationships.md`

- `<monorepo-app>/app/controllers/reviewer_applications_controller.ts` (new).
  - `index` - wiring: `auth.getUserOrFail()`, reviewer-workspace ability, `request.input('reviewState')`, Application queue scope, pagination, `ApplicationTransformer.paginate(...)`, `serialize(...)`.
    - Default ordering is most recent workflow activity first so the queue stays usable.
    - `reviewState` is a whitelist branch in the controller, not a generic update field.
  - `show` - wiring: `auth.getUserOrFail()`, reviewer-workspace ability, scoped Application lookup, relation preloads, `ApplicationTransformer.transform(...).useVariant('forReviewerDetail')`, `serialize(...)`.
    - The queue scope is the visibility boundary; inaccessible rows should resolve as 404.
- `<monorepo-app>/app/controllers/application_review_starts_controller.ts` (new).
  - `store` - wiring: `auth.getUserOrFail()`, reviewer-workspace ability, `ApplicationReviewStartService.start(...)`, `ApplicationTransformer.transform(...).useVariant('forReviewerDetail')`, `serialize(...)`.
    - This action stays in its own controller because it is an explicit transition with its own atomic write and 409 conflict path.

- DI: method-level `@inject()` on `ApplicationReviewStartsController.store`; no constructor DI on the queue controller.
- Per-action middleware overrides: none beyond the reviewer route group's `auth` middleware.

## Response layer

Reads: `transformers.md`, `response.md`, `exception-handling.md`

- `<monorepo-app>/app/transformers/application_transformer.ts` - `ApplicationTransformer`.
- Fields needing transformation:
  - `applicant` - `UserTransformer` output from the preloaded applicant relation.
  - `assignedReviewer` - `UserTransformer` output from the preloaded reviewer relation, or `null` when the application is still unclaimed.
  - `reviewState` - computed queue-state label derived from `status` and `assignedReviewerId`.
  - `forReviewerDetail()` variant - adds `description` and `amount` on top of the queue summary.
- Pass-through fields: `id`, `title`, `category`, `status`, `createdAt`, `updatedAt`.
- Relationships to preload before transform: `applicant`, `assignedReviewer`.
- Runtime context required: none.
- Wrapping mode: `serialize` for both the paginated queue and the single-application detail/start-review responses.
- Success status: `response.status(200)`.
- Recoverable errors: none.
- Self-handled exceptions thrown: `ApplicationTransitionConflictException`.

## Routes

Reads: `routing.md`

```diff title="<monorepo-app>/start/routes.ts"
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
   })
   .prefix('/api/v1')

+router
+  .group(() => {
+    router.resource('applications', controllers.ReviewerApplications).only(['index', 'show'])
+    router.post('applications/:id/review-starts', [controllers.ApplicationReviewStarts, 'store'])
+  })
+  .prefix('/api/v1/reviewer')
+  .use(middleware.auth())
```

Verify route names with `cd <monorepo-app> && node ace list:routes`.

## Events + side effects

Reads: `exceptions.md`, `transactions.md`

_n/a: no new events, listeners, or post-commit side effects are introduced in this slice._

## Test coverage gap

Reads: `testing.md`

Existing coverage in this repo only exercises auth plumbing. New tests should cover:

- Reviewer queue list returns the paginated combined queue by default, plus the `ready` and `owned` filters.
- Reviewer queue list and detail routes reject non-reviewer users with 403.
- Reviewer detail hides inaccessible records with 404 rather than leaking them.
- Start review succeeds on an eligible submitted application, sets `status = UNDER_REVIEW`, assigns the reviewer, and writes one audit-log row in the same transaction.
- Start review rejects an ineligible application with 409 and leaves the application unchanged.

Suggested files:

- `<monorepo-app>/tests/functional/reviewer_applications.spec.ts`
- `<monorepo-app>/tests/unit/application_review_start_service.spec.ts`
