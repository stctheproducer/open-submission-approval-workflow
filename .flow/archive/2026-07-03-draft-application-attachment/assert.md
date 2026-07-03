# Draft Application Attachment — Test Plan

> Stack: AdonisJS API
> Source: `.flow/changes/draft-application-attachment/blueprint.md`
> Date: 2026-07-03

## Summary

This plan covers draft-only supporting file uploads for applications. It locks the valid upload path, replacement behavior, validation failures, and the existing non-draft and ownership guards.

## Pre-implementation requirements

None.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| ------------------- | -------- | ----- |
| Authenticated applicant can upload an attachment to an owned draft application | add | — |
| Authenticated applicant can replace the current attachment on an owned draft application | add | — |
| Invalid file type is rejected before any state change | add | — |
| Invalid file size is rejected before any state change | add | — |
| Unauthenticated caller is rejected from attachment upload | add | — |
| Foreign or missing draft application is not revealed | add | — |
| Non-draft application rejects attachment changes with a conflict error | add | — |

## Test list (ordered)

Reads: testing.md

1. `T1` functional - uploads an attachment to an owned draft application
2. `T2` functional - replaces the current attachment on an owned draft application
3. `T3` functional - rejects an invalid file type
4. `T4` functional - rejects an oversized file
5. `T5` functional - rejects unauthenticated attachment uploads
6. `T6` functional - returns 404 for a foreign or missing application
7. `T7` functional - rejects attachment changes on a non-draft application

## Per-test contracts

Reads: testing.md

### T1

- Surface: `app/controllers/application_attachments_controller.ts#store`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; owned draft application via `ApplicationFactory`; valid PDF file via the test file helper.
- Action: `POST` the nested applicant attachment route with multipart form data containing one `attachment` file.
- Outcome contract: status `200`; wrapped single-resource response; the application detail includes the current attachment URL or file key in the transformer output; the `applications` row stores the new attachment key.
- Does NOT assert: replacement behavior, frontend rendering, or file contents on disk.
- Why: proves a draft application accepts one valid current attachment.

### T2

- Surface: `app/controllers/application_attachments_controller.ts#store`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; owned draft application with an existing attachment key via `ApplicationFactory`; valid replacement file via the test file helper.
- Action: `POST` the nested applicant attachment route with multipart form data containing a newer `attachment` file.
- Outcome contract: status `200`; wrapped single-resource response; the application row now points at the newer attachment key; the previous attachment key is no longer the current file for that application.
- Does NOT assert: the storage implementation details of the old file beyond the replacement contract.
- Why: proves replacement is in place and only the latest attachment remains current.

### T3

- Surface: `app/controllers/application_attachments_controller.ts#store`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; owned draft application via `ApplicationFactory`; invalid file fixture with a disallowed extension.
- Action: `POST` the nested applicant attachment route with multipart form data containing the invalid file.
- Outcome contract: status `422`; top-level `errors` array with a file validation error for `attachment`; the application row does not change.
- Does NOT assert: any Drive writes or route-level auth behavior.
- Why: the upload validator must reject unsupported file types before state changes.

### T4

- Surface: `app/controllers/application_attachments_controller.ts#store`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; owned draft application via `ApplicationFactory`; oversized file fixture above 5 MB.
- Action: `POST` the nested applicant attachment route with multipart form data containing the oversized file.
- Outcome contract: status `422`; top-level `errors` array with a file validation error for `attachment`; the application row does not change.
- Does NOT assert: any Drive writes or route-level auth behavior.
- Why: the upload validator must reject files larger than the maximum size.

### T5

- Surface: `app/controllers/application_attachments_controller.ts#store`
- Suite: functional
- Setup: no auth; no factories or fakes.
- Action: `POST` the nested applicant attachment route with multipart form data containing any file.
- Outcome contract: status `401`.
- Does NOT assert: body shape beyond the rejection status.
- Why: attachment uploads stay inside the authenticated applicant route group.

### T6

- Surface: `app/controllers/application_attachments_controller.ts#store`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; foreign draft application owned by a different applicant via `ApplicationFactory`; missing-id case via a nonexistent id.
- Action: `POST` the nested applicant attachment route with multipart form data containing a valid file.
- Outcome contract: status `404` for both the foreign and missing application rows.
- Does NOT assert: any file upload side effect or non-draft conflict behavior.
- Why: the attachment path must not reveal applications the caller does not own.

### T7

- Surface: `app/controllers/application_attachments_controller.ts#store`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; owned non-draft application via `ApplicationFactory`; valid file fixture.
- Action: `POST` the nested applicant attachment route with multipart form data containing one valid `attachment` file.
- Outcome contract: status `409`; the application row remains unchanged.
- Does NOT assert: file validation failures, 404 behavior, or any replacement outcome.
- Why: attachment changes are limited to draft applications only.

## Runner-model risks

Reads: testing.md

- None identified. Each case is isolated by a fresh DB truncate and uses a single request per test.
