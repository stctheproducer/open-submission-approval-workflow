---
planned: 2026-07-02
built: 2026-07-02
---

# Application Draft Ownership — Blueprint

## Goal

Build the applicant-owned baseline for `Application` records: an authenticated applicant can create a draft, see only their own applications, reopen one of their own drafts, and keep editing it until it leaves draft state.

This slice stops at draft ownership. It does not add submission, review, approval, rejection, or audit-history writes.

## Main Decisions

| Decision | Why |
| --- | --- |
| Use a dedicated applicant workspace route surface | The brief is about the applicant's personal record lifecycle, so the API should make ownership explicit instead of mixing applicant and reviewer paths. |
| Protect the workspace with the session guard | The repo's deployment target is same-origin browser auth, and this journey is a signed-in applicant flow, not a token flow. |
| Keep the `Application` resource as the core record | The workflow already treats `Application` as the domain noun; the draft slice should not introduce a competing term. |
| Treat non-owner access as not found | The brief says another applicant's record must stay private, so the failure should not reveal existence. |
| Treat edits to non-draft applications as a conflict | The payload may be valid, but the state is not, so this is a workflow-rule failure rather than validation. |
| Paginate the list endpoint from day one | The repo convention is to introduce list pagination immediately, even for small collections. |
| Do not write audit-log entries for plain draft edits | The repo's domain rules reserve the audit log for status transitions, not routine draft changes. |

## Backend Plan

### 1. Add the core `Application` data model

- Create the `applications` table with:
  - applicant ownership via `user_id`
  - a draft status column with `draft` as the default
  - timestamps
  - any draft-editable columns the current UI needs, kept optional where the draft can start blank
- Add the `Application` model and the `User` relationship needed for ownership queries.
- Add a factory for `Application` so the test suite can build owned drafts and foreign records easily.
- Add a backend-owned `ApplicationStatus` value module so draft state is not hard-coded across controllers and tests.

### 2. Add applicant-draft validation and ownership rules

- Create an `application` validator file with separate create/update validators for the draft workspace.
- Keep the create flow capable of starting from a blank draft, so the initial `store` action can create ownership first and defer content filling to `update`.
- Validate whatever draft fields the workspace exposes, but do not force future review-state fields into this slice.
- Add an `ApplicationPolicy` for ownership checks on `show` and `update`.
- Use a 404-style denial for foreign records so an applicant cannot infer whether another applicant's application exists.

### 3. Add a draft workflow service

- Introduce an `ApplicationDraftService` to keep the controller thin.
- Put the workflow-specific rules in the service:
  - create a new draft for the authenticated applicant
  - scope application queries to the current applicant
  - load a single owned application for detail/edit views
  - reject updates when the record is no longer in draft
- Keep this service HTTP-agnostic. It should accept models and validated payloads, not `HttpContext`.
- Do not add audit-log writes or multi-record transaction logic here. This slice is a single-record draft lifecycle, not a status transition.

### 4. Add the applicant route surface

- Add an explicit applicant group under `/api/v1` for applications.
- Use a resource-style controller backed by `ApplicationsController` with the collection/member actions the slice needs:
  - `index` for the applicant's own applications
  - `store` for creating a new draft
  - `show` for reopening an owned draft
  - `update` for saving draft edits
- Keep the reviewer workflow on a separate route surface later. Do not reuse this applicant surface for reviewer actions.
- Protect the route group with the session-based auth middleware and the applicant authorization checks at the action boundary.

### 5. Shape responses consistently

- Add an `ApplicationTransformer` so list and detail payloads stay explicit and API-shaped.
- Include the record's status and any draft-state flag the frontend needs to disable editing when the application is locked.
- Return paginated collections through the serializer with stable newest-first ordering.
- Return created drafts with `201 Created`.
- Return foreign-record and locked-draft failures through the app's Problem Details-style error envelope.

## Frontend Plan

- Replace the placeholder frontend shell with an applicant workspace that consumes the new application endpoints.
- Add the applicant list view first, then a draft detail/edit view that can reopen an owned draft and save changes.
- Keep the UI focused on the applicant journey only. Do not add reviewer queue or transition UI in this slice.
- Reuse one form component for create and update if the draft payloads line up, so the blank-draft and edit flows stay visually consistent.

## Tests

- Add functional tests for:
  - creating a draft as the authenticated applicant
  - listing only the current applicant's applications
  - showing one of the applicant's own drafts
  - updating an owned draft successfully
  - rejecting access to another applicant's application
  - rejecting updates once the application is no longer draft
- Assert the response status before the body.
- Assert DB ownership and status directly so the tests prove the row stayed private and unchanged.
- Include pagination assertions on the list endpoint from the start.
- Use factories for all setup so the tests stay readable and isolated.

## Implementation Order

1. Schema, model, values, and factory.
2. Validator, transformer, policy, and draft service.
3. Routes and controller wiring.
4. Functional tests.
5. Frontend workspace wiring against the finished API.

## Explicit Non-Goals

- No submission action.
- No review workflow.
- No approval, rejection, or change-request paths.
- No audit-log entry for draft create/update.
- No reviewer queue UI.
