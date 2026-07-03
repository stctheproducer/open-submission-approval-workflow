# Draft Application Attachment — Blueprint

> Stack: AdonisJS API
> Source: `.flow/changes/draft-application-attachment/brief.md`
> Date: 2026-07-03

## Summary

`Reads: controllers.md, response.md, validation.md, authentication.md, authorization.md, file-uploads.md, transactions.md, testing.md`

Draft applications gain a single current supporting attachment. Applicants upload one file through a nested draft-attachment endpoint, and replacements supersede the prior file while keeping the application record in sync. The attachment file key lives on the application row; the file itself is stored on Drive.

## Pre-implementation requirements

None.

## Logical schema

`Reads: migrations.md, models.md, file-uploads.md`

- `applications` gains a nullable `attachmentKey` string column.
  - Stores only the Drive file key for the current attachment.
  - The key is replaced in place when a newer attachment is accepted.

## Migrations + models

`Reads: migrations.md, models.md`

- `database/migrations/*_add_attachment_key_to_applications.ts` — new
  - Adds the nullable `attachment_key` column to `applications`.
- `apps/backend/app/models/application.ts` — modified
  - Adds the `attachmentKey` column on the application model.
  - Keeps the attachment state on the application record rather than a separate table.

## Controller layout

`Reads: controllers.md`

- `apps/backend/app/controllers/application_attachments_controller.ts` — new
  - `store` accepts a single uploaded file for an owned draft application.
  - No separate `update` route is needed; repeated `store` requests replace the current attachment.

## Service design

`Reads: services.md, transactions.md, file-uploads.md`

- `apps/backend/app/services/application_attachment_service.ts` — new
  - `replace(application, attachment)` persists the new file key and swaps out the previous one atomically from the application record's perspective.
  - Uses a transaction so the row update and attachment state change succeed or fail together.
  - Registers deletion of the superseded file after commit so the old file is not removed until the new key is durable.
  - Does not handle authorization or request validation.

## Validation rules

`Reads: validation.md, file-uploads.md`

- `apps/backend/app/validators/application_attachment.ts` — new
  - Validates one file named `attachment`.
  - Allowed types: PDF, PNG, JPEG, DOCX.
  - Maximum size: 5 MB.

## Authz + segregation

`Reads: authentication.md, authorization.md`

- `apps/backend/start/routes.ts` keeps the endpoint inside the applicant-authenticated route group.
- `apps/backend/app/controllers/application_attachments_controller.ts` keeps the ownership check on the applicant-owned draft path.
- The controller rejects non-draft applications by surfacing the existing conflict behavior.

## Controllers

`Reads: controllers.md, response.md, file-uploads.md`

- `apps/backend/app/controllers/application_attachments_controller.ts` — new
  - `store`
    - Validates the upload before touching Drive or the database.
    - Finds the owned draft application through the applicant draft path.
    - Calls the attachment service to persist the new file and supersede the old one.
    - Returns the application through the existing transformer so the current attachment state is visible in the same detail shape.

## Response layer

`Reads: response.md, file-uploads.md`

- `apps/backend/app/transformers/application_transformer.ts` — modified
  - Adds the current attachment file URL when `attachmentKey` is present.
  - Pass-through fields remain unchanged for the rest of the application detail.
- The action returns a wrapped single-resource response.

## Routes

`Reads: controllers.md`

- `apps/backend/start/routes.ts` — modified
  - Adds an applicant-authenticated nested route for the attachment resource under applications.
  - The route name should be typed and route through `client.visit(...)` in tests.

## Events + side effects

`Reads: transactions.md`

- Old attachment file deletion happens after the transaction commits.
- A failed replacement leaves the previous file key and file in place.

## Testing

`Reads: testing.md`

- `apps/backend/tests/functional/applications/attachments.spec.ts` — new
  - Proves an authenticated applicant can upload a valid attachment to an owned draft application.
  - Proves a replacement upload updates the application to the newer file key and does not leave the prior file as the current attachment.
  - Proves a non-draft application rejects attachment changes with the existing conflict behavior.
  - Proves a foreign or missing application still resolves as not found.
  - Proves invalid type and size are rejected with validation errors before any state change.

## Out of scope

- Multiple attachments per application.
- Frontend wiring.
- Direct browser-to-cloud uploads.
