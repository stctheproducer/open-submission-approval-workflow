---
planned: 2026-07-03
built: 2026-07-03
---

# Application Schema Reset — Implementation Plan

> Task type: modification
> Stack: AdonisJS API
> Database: PostgreSQL

## Summary

This change resets the application data model so fresh installs start from the spec shape instead of the legacy contact/organization draft shape. The base applications table will include the reviewer assignment and file-attachment columns up front, the required application fields will be required in validation, and the response layer will stop exposing the retired fields.

## Out of scope

- Reviewer workflow changes - this reset keeps the existing review queue and transition model intact.
- Event or listener work - the schema reset does not introduce a new side-effect pipeline.

## Current shape

Reads: models.md, migrations.md

- `apps/backend/database/migrations/1783011095532_create_applications_table.ts` creates a draft shell with `user_id`, `status`, and the legacy `organization_name`, `contact_name`, and `contact_email` columns.
- `apps/backend/database/migrations/1783011095535_add_reviewer_fields_to_applications_table.ts` adds `assigned_reviewer_id`, `title`, `category`, `description`, and `amount` in a later migration.
- `apps/backend/database/migrations/1783053487107_alter_applications_table.ts` adds `attachment_key` in a separate alter migration.
- `apps/backend/app/services/application_draft_service.ts` creates a blank draft first, then the controller merges optional payload fields onto it.
- `apps/backend/app/transformers/application_transformer.ts` still falls back `title` to `organizationName` and returns the retired organization/contact fields.
- `apps/backend/app/validators/application.ts` still treats the legacy contact fields as optional request inputs.
- `apps/backend/database/schema.ts` still advertises the stale generated column set, so typed code still knows about the removed fields.

## Target shape

Fresh databases should create `applications` once, with `user_id`, `assigned_reviewer_id`, `status`, `title`, `category`, `description`, `amount`, `attachment_key`, and timestamps. `title`, `category`, `description`, and `amount` are required at the schema and validation level, `attachment_key` stays optional, and the response layer only exposes the spec-era application fields.

## Logical schema

Reads: models.md, migrations.md, schema-rules.md

```dbml
Table applications {
  id integer [pk, increment]
  user_id integer [not null, ref: > users.id, delete: cascade]
  assigned_reviewer_id integer [ref: > users.id, delete: set null]
  status varchar [not null, default: "draft"]
  title varchar [not null]
  category varchar [not null]
  description text [not null]
  amount decimal(12,2) [not null]
  attachment_key varchar
  created_at timestamp [not null]
  updated_at timestamp

  indexes {
    (user_id)
    (assigned_reviewer_id)
    (status)
  }
}
```

The database stays faithful to the draft workflow by keeping `assigned_reviewer_id` nullable and `attachment_key` optional. The application fields themselves are non-nullable because the draft is created with the full payload instead of being born empty.

## Migrations + models

Reads: models.md, migrations.md

`cd apps/backend && node ace make:migration applications`

Migration files (ordered):

- `apps/backend/database/migrations/1783011095532_create_applications_table.ts` - recreate the applications table with the final spec columns in the base migration.
- `apps/backend/database/migrations/1783053487107_alter_applications_table.ts` - delete this file entirely; `attachment_key` belongs in the base table for fresh installs.

`cd apps/backend && node ace make:model Application`

Model files:

- `apps/backend/database/schema.ts` (modified, generated) - refresh `ApplicationSchema` so the typed snapshot drops `organizationName`, `contactName`, and `contactEmail`, and reflects the reset columns for `title`, `category`, `description`, `amount`, `assignedReviewerId`, and `attachmentKey`.
- `apps/backend/app/models/application.ts` (unchanged at source) - keep the existing `belongsTo(user)`, `belongsTo(assignedReviewer)`, `hasMany(auditLogEntries)`, `hasMany(statusTransitions)`, `reviewQueue` scope, and `isDraft` accessor; the schema reset changes the underlying columns, not the model relationships.

`cd apps/backend && node ace migration:run`

## Service design

Reads: controllers.md

`cd apps/backend && node ace make:service application_draft`

- `apps/backend/app/services/application_draft_service.ts` - ApplicationDraftService.
  - `create(userId: number, payload: { title: string; category: string; description: string; amount: number }): Promise<Application>` - persist a complete draft application up front and return the created record ready for serialization.
    - Preload the applicant relation before returning so the response transformer can render the creator without an undefined gap.
  - `listForUser(userId: number, page: number, perPage: number): Promise<SimplePaginator<Application>>` - return the applicant-owned application list in descending creation order.
    - Keep the ownership filter and list ordering centralized here rather than repeating the query shape in controllers.
  - `findForUser(userId: number, id: number): Promise<Application>` - fetch one applicant-owned application for show, update, attachment replacement, and reopen flows.
    - Preload the relations needed by the transformer (`user`, `assignedReviewer`, and `statusTransitions.actor` for detail views) so the controller can stay thin.
  - `update(application: Application, payload: Partial<{ title: string; category: string; description: string; amount: number }>): Promise<Application>` - merge draft edits, enforce the draft-state guard, persist the row, and return the updated model.
    - Keep the illegal-transition check in the service so both the update route and any other draft-edit path share the same rule.
  - Does NOT: validate HTTP input, move or delete uploaded files, or shape API responses.

## Validation

Reads: validation.md, vine/types/string.md, vine/types/number.md, vine/types/enum.md, vine/types/file.md

### Input validation

`cd apps/backend && node ace make:validator application`

```ts title="apps/backend/app/validators/application.ts"
import vine from "@vinejs/vine"
import { APPLICATION_CATEGORY_VALUES } from "#values/application_category_options"

export const createApplicationValidator = vine.create({
  title: vine.string().trim().minLength(1).maxLength(255),
  category: vine.enum(APPLICATION_CATEGORY_VALUES),
  description: vine.string().trim().minLength(1),
  amount: vine.number().decimal(2).positive(),
})

export const updateApplicationValidator = vine.create({
  title: vine.string().trim().minLength(1).maxLength(255).optional(),
  category: vine.enum(APPLICATION_CATEGORY_VALUES).optional(),
  description: vine.string().trim().minLength(1).optional(),
  amount: vine.number().decimal(2).positive().optional(),
})
```

### Business rules

- The create path requires the full application payload because the application row is no longer created as an empty draft shell. Owner: `ApplicationsController.store`.
- Partial edits stay allowed on the draft update path, but blanking a field out is not; the service keeps the draft-state guard and the validator rejects `null`. Owner: `ApplicationDraftService.update` plus `updateApplicationValidator`.
- Supporting-file validation stays separate from scalar application validation. Owner: `ApplicationAttachmentsController.store` via `applicationAttachmentValidator`.

## Authorization + segregation

Reads: authentication.md, authorization.md

- `_n/a (task type: modification)` for new policy / ability files and permission keys; this reset does not introduce a new Bouncer surface.

- Query segregation:
  - `ApplicationDraftService.listForUser` and `ApplicationDraftService.findForUser` continue to scope applicant data by `userId`.
  - `ApplicationAttachmentsController.store` continues to resolve the application through the applicant-owned lookup before checking draft state and replacing the attachment.
  - The reviewer queue boundary remains the existing `Application.reviewQueue` scope; this schema reset does not change reviewer-side access rules.

## Controllers

Reads: controllers.md

- `apps/backend/app/controllers/applications_controller.ts` (modified).
  - `index` - wiring: `auth`, `request` pagination inputs, `ApplicationDraftService.listForUser`, `ApplicationTransformer`, `serialize`.
    - Keep applicant scoping inside the service; the controller only parses pagination and forwards the request-scoped user id.
  - `store` - wiring: `request.validateUsing(createApplicationValidator)`, `ApplicationDraftService.create`, `ApplicationTransformer`, `response.status(201)`, `serialize`.
    - The create path now persists a fully populated draft up front; there is no blank-draft insert followed by a merge.
  - `show` - wiring: `ApplicationDraftService.findForUser`, `ApplicationTransformer`, `serialize`.
    - Reuse the ownership-scoped service lookup so the detail response and update path share the same preload shape.
  - `update` - wiring: `request.validateUsing(updateApplicationValidator)`, `ApplicationDraftService.findForUser`, `ApplicationDraftService.update`, `ApplicationTransformer`, `serialize`.
    - Keep the draft-state guard in the service; the controller stays as request parsing + response delivery.

- `apps/backend/app/controllers/application_attachments_controller.ts` (modified).
  - `store` - wiring: `request.validateUsing(applicationAttachmentValidator)`, `ApplicationDraftService.findForUser`, `ApplicationAttachmentService.replace`, `ApplicationTransformer`, `serialize`.
    - Keep attachment upload separate from scalar application updates so the file payload never gets merged into the application model data.
    - Reuse the shared applicant-owned lookup before checking draft state, rather than duplicating an ownership query in the controller.

- DI: constructor injection for `ApplicationDraftService` and `ApplicationAttachmentService`.
- Per-action middleware overrides: none.

## Response layer

Reads: transformers.md, response.md, exception-handling.md

- `apps/backend/app/transformers/application_transformer.ts` - ApplicationTransformer.
  - Fields needing transformation:
    - `title` - emit the application title directly; remove the legacy `organizationName` fallback.
    - `attachmentUrl` - derive a public URL from `attachmentKey` with Drive when present, otherwise `null`.
    - `applicant` - transform the preloaded `user` relation with `UserTransformer`.
    - `assignedReviewer` / `reviewer` - transform the preloaded `assignedReviewer` relation with `UserTransformer` so the response keeps the existing reviewer shape.
    - `reviewState` - compute from `assignedReviewerId`, the loaded reviewer relation, and the current status.
    - `statusTransitions` / `history` - transform the preloaded transition collection with `ApplicationStatusTransitionTransformer`.
  - Pass-through fields: `id`, `category`, `description`, `amount`, `status`, `createdAt`, `updatedAt`.
  - Relationships to preload before transform: `user`, `assignedReviewer`, and `statusTransitions.actor` on the detail/update paths that expose applicant metadata and workflow history; `user` and `assignedReviewer` on list responses that surface applicant/reviewer names.
  - Runtime context required: none.
  - Wrapping mode: `serialize(ApplicationTransformer.transform(...))` for single-resource responses and `serialize(ApplicationTransformer.paginate(...))` for the applicant list.
  - Success status: `201` on create; `200` on show, update, attachment replacement, and list responses.
  - Recoverable errors: validation failures from `request.validateUsing(...)` stay as the existing 422 validation envelope; ownership misses continue to surface through the existing not-found handling.
  - Self-handled exceptions thrown: `ApplicationTransitionConflictException` for update or attachment replacement attempts when the record is not still a draft.

## Routes

Reads: routing.md

_n/a (task type: modification)_

## Events + side effects

Reads: _n/a_

_n/a (task type: modification)_

## Test coverage gap

Reads: testing.md

The existing application tests already cover draft creation, updates, attachment replacement, and conflict handling, but they assert against the old response and request shape. This reset needs the application factory and the functional application tests updated so they seed and assert the new required fields (`title`, `category`, `description`, `amount`) instead of the retired organization/contact fields.

- [`apps/backend/tests/functional/applications/store.spec.ts`](/Users/stctheproducer/Developer/personal-projects/open-submission-approval-workflow/apps/backend/tests/functional/applications/store.spec.ts) should create a valid application payload and assert the wrapped response contains the new core fields.
- [`apps/backend/tests/functional/applications/update.spec.ts`](/Users/stctheproducer/Developer/personal-projects/open-submission-approval-workflow/apps/backend/tests/functional/applications/update.spec.ts) should update the new editable fields and stop asserting on `organizationName`, `contactName`, and `contactEmail`.
- [`apps/backend/tests/functional/applications/attachments.spec.ts`](/Users/stctheproducer/Developer/personal-projects/open-submission-approval-workflow/apps/backend/tests/functional/applications/attachments.spec.ts) should keep the replacement assertions but seed applications with the reset schema.
- Factory coverage should be aligned with the new schema so the tests do not keep synthesizing retired columns.
