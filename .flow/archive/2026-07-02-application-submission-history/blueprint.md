---
planned: 2026-07-02
built: 2026-07-02
---

# Application Submission History — Implementation Plan

> Task type: extension
> Stack: AdonisJS API
> Database: PostgreSQL

## Summary

This slice introduces the applicant-facing application detail route, an explicit submission transition resource, and an audit-log-backed history payload. A successful submission moves a draft `Application` into the reviewer workflow inside one transaction and immediately surfaces that transition on the application detail response.

## Pre-implementation requirements

_n/a_

## Out of scope

- Applicant draft creation, editing, and list views. Those belong to the draft-ownership slice.
- Reviewer queue, review start, approval, rejection, and change-request routes. Those belong to later reviewer slices.
- Search, notifications, and attachment versioning. They are not required to prove submission history.

## Current shape

- The backend currently has only the starter auth/account surfaces: signup, login, logout, and profile.
- There is no `Application` model, no audit-log model, and no workflow controller surface yet.
- The API route file is still limited to the `/api/v1/auth/*` and `/api/v1/account/*` groups.
- The project glossary already defines `Application`, `Application submission`, `Audit log entry`, and the workflow status set, so the plan should use that vocabulary consistently.

## Target shape

Applicants can fetch their own application detail, submit a draft through an explicit transition resource, and see the submission recorded in the application history immediately after the transition succeeds. The submission itself is atomic: one transaction updates the application status and writes the audit log entry. The detail response includes the submitted application state plus an ordered history array that later workflow slices can extend.

## Logical schema

Reads: `models.md`, `model-relationships.md`, `migrations.md`, `schema-rules.md`

```dbml
Table applications {
  id integer [pk, increment]
  applicant_id integer [not null, ref: > users.id]
  title varchar(255) [null]
  category varchar(100) [null]
  description text [null]
  amount decimal(12,2) [null]
  status varchar(32) [not null, default: 'DRAFT']
  created_at timestamp [not null]
  updated_at timestamp [not null]

  indexes {
    (applicant_id, status) [name: 'applications_applicant_status_index']
    (applicant_id, created_at) [name: 'applications_applicant_created_at_index']
  }
}

Table application_audit_log_entries {
  id integer [pk, increment]
  application_id integer [not null, ref: > applications.id]
  actor_user_id integer [not null, ref: > users.id]
  previous_status varchar(32) [not null]
  next_status varchar(32) [not null]
  comment text [null]
  created_at timestamp [not null]

  indexes {
    (application_id, created_at) [name: 'application_audit_log_entries_app_created_at_index']
  }
}
```

- Status values stay as backend-owned portable strings, not database enums.
- Audit log rows are append-only and record status transitions only, not draft edits.
- History ordering is oldest-first on `created_at` so the submission is the first visible entry after the initial transition.
- The applicant relationship is the visibility boundary for owner-only reads.

## Migrations + models

Reads: `migrations.md`, `models.md`

`cd <monorepo-app> && node ace make:migration create_applications`
`cd <monorepo-app> && node ace make:migration create_application_audit_log_entries`

Migration files (ordered):

- `<monorepo-app>/database/migrations/<timestamp>_create_applications_table.ts` — creates the core `applications` table with applicant ownership, status, draft-friendly content columns, and timestamps.
- `<monorepo-app>/database/migrations/<timestamp>_create_application_audit_log_entries_table.ts` — creates the append-only audit log table for status transitions.

`cd <monorepo-app> && node ace make:model Application`
`cd <monorepo-app> && node ace make:model ApplicationAuditLogEntry`

Model files:

- `<monorepo-app>/app/models/application.ts` (new) — `Application` extends `ApplicationSchema`.
  - `@belongsTo(() => User)` applicant relationship for owner-scoped reads.
  - `@hasMany(() => ApplicationAuditLogEntry)` history relation for the visible workflow trail.
  - `get isDraft()` accessor — checks whether the application can still be submitted.

- `<monorepo-app>/app/models/application_audit_log_entry.ts` (new) — `ApplicationAuditLogEntry` extends `ApplicationAuditLogEntrySchema`.
  - `@belongsTo(() => Application)` parent application relationship.
  - `@belongsTo(() => User)` actor relationship for the user who performed the transition.

- `<monorepo-app>/app/values/application_status.ts` (new) — canonical string-backed workflow status set shared by the model, service, policy, and transformers.

`cd <monorepo-app> && node ace migration:run`

## Service design

Reads: `controllers.md`, `services.md`, `transactions.md`, `models.md`

`cd <monorepo-app> && node ace make:service application_submission`

- `<monorepo-app>/app/services/application_submission_service.ts` — `ApplicationSubmissionService`.
  - `submit(application: Application, actor: User): Promise<void>` — performs the draft-to-submitted transition, writes the audit log entry, and keeps the writes atomic.
  - Does NOT: load request context, perform authorization, or shape the API response.

## Validation

Reads: `validation.md`

### Input validation

_n/a for this slice_ - the submission action is driven by the route param and authenticated user, not a request body payload.

### Business rules

- Only a draft application can be submitted. Owner: `ApplicationSubmissionService.submit`.
- A submission must be written together with its audit log row in the same transaction. Owner: `ApplicationSubmissionService.submit`.
- A non-owner cannot submit another applicant's application. Owner: `ApplicationPolicy.submit` at the controller entry point.

## Authorization + segregation

Reads: `authentication.md`, `authorization.md`

`cd <monorepo-app> && node ace make:policy application`

- `<monorepo-app>/app/policies/application_policy.ts` — `ApplicationPolicy`.
  - `view(user: User, application: Application)` — allows an applicant to open their own application detail and returns a 404 denial for ownership misses.
  - `submit(user: User, application: Application)` — allows an applicant to submit their own application and returns a 404 denial for ownership misses.

- Query segregation:
  - `ApplicationsController.show` and `ApplicationSubmissionsController.store` both load by application id, then call the policy at the entry point so ownership stays explicit and the denial shape stays consistent.

## Controllers

Reads: `controllers.md`, `http-context.md`, `request.md`, `middleware.md`, `model-relationships.md`

`cd <monorepo-app> && node ace make:controller applications`
`cd <monorepo-app> && node ace make:controller application_submissions`

- `<monorepo-app>/app/controllers/applications_controller.ts` (new).
  - `show` — wiring: `ApplicationPolicy.view`, `ApplicationTransformer` detailed variant, `auditLogEntries` preload, `UserTransformer` for history actors.
    - Preload the audit log entries in oldest-first order so the submission appears first in the visible history.
    - Keep the controller thin: lookup, authorize, transform, respond.

- `<monorepo-app>/app/controllers/application_submissions_controller.ts` (new).
  - `store` — wiring: `ApplicationPolicy.submit`, `ApplicationSubmissionService.submit`, refetch of the submitted application, `ApplicationTransformer` detailed variant.
    - Authorize before the write so ownership failures stay at the entry point.
    - Use the service for the state change plus audit-log insert because the transition must be atomic.
    - Refetch after the commit so the response includes the persisted submission history.
    - Non-default path reason: this is a workflow transition, not a CRUD create/update action, so the write belongs in a domain service.

- DI: method injection on `ApplicationSubmissionsController.store`; none on `ApplicationsController`.
- Per-action middleware overrides: `auth()` on both actions.

## Response layer

Reads: `transformers.md`, `response.md`, `exception-handling.md`

`cd <monorepo-app> && node ace make:transformer application`
`cd <monorepo-app> && node ace make:transformer application_audit_log_entry`

- `<monorepo-app>/app/transformers/application_transformer.ts` — `ApplicationTransformer`.
  - Pass-through fields: `id`, `applicantId`, `title`, `category`, `description`, `amount`, `status`, `createdAt`, `updatedAt`.
  - `history`: `ApplicationAuditLogEntryTransformer.transform(...)` over the loaded audit log entries.
  - Relationships to preload before transform: `auditLogEntries` and each entry's `actor`.
  - Runtime context required: none.
  - Variant: `forDetailedView()` adds the visible history needed by the detail page and by the submission response.
- `<monorepo-app>/app/transformers/application_audit_log_entry_transformer.ts` — `ApplicationAuditLogEntryTransformer`.
  - `recordedAt`: `{ raw: string, formatted: string }` so the history reads as a user-facing timeline entry.
  - `performedBy`: `UserTransformer.transform(...)` for the actor who made the transition.
  - Pass-through fields: `id`, `previousStatus`, `nextStatus`, `comment`.
  - Relationships to preload before transform: `actor`.
  - Runtime context required: `HttpContext` injected into `toObject()` so `i18n` can format the recorded timestamp.

- Wrapping mode: `serialize` for both `show` and `store` because both return a single application resource body.
- Success status: `response.status(200)` for both actions.
- Recoverable errors: none.
- Self-handled exceptions thrown: `ApplicationTransitionConflictException` for a draft-state violation; built-in authorization failure handling for ownership denials and not-found handling from the model lookup.

`cd <monorepo-app> && node ace make:exception application_transition_conflict`

## Routes

Reads: `routing.md`

```diff title="<monorepo-app>/start/routes.ts"
+    router.resource('applications', controllers.Applications).only(['show']).use('*', middleware.auth())
+    router.resource('applications.submissions', controllers.ApplicationSubmissions).only(['store']).use('*', middleware.auth())
```

Verify route names with `cd <monorepo-app> && node ace list:routes`.

## Events + side effects

Reads: `transactions.md`

_n/a_ - this slice keeps the submission transition inside the application transaction and does not introduce a separate event or listener surface.

## Test coverage gap

There are no application workflow tests yet. Add functional coverage for:

- an owner submitting a draft application and receiving the submitted detail payload with the first history entry visible
- a non-owner being denied submission
- a submission attempt against a non-draft application being rejected without changing the application or creating a new audit log row
- the application detail route returning the ordered history payload for a submitted application
