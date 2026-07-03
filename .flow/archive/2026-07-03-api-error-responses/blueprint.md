---
affects: [api-error-responses]
planned: 2026-07-03
built: 2026-07-03
---

# API Error Responses — Blueprint

Reads: exception-handling.md, testing.md

## Pre-implementation requirements

- None. This change stays inside the existing backend API app and does not require a new package or schema surface.

## Current shape

- `apps/backend/app/exceptions/handler.ts` currently detects request failures by status code and returns `{ errors: [{ message }] }` for `400`, `401`, `403`, `404`, `409`, and `422`.
- Built-in validation and auth exceptions are already treated as self-handled by the framework, so the global handler needs explicit reshaping for those categories if the app-wide contract is to become uniform.
- Existing functional coverage already exercises application journeys that fail with validation, auth, not-found, and conflict-style responses, so the blast radius is concentrated in the handler plus the assertions that currently expect the old envelope.

## Decision list

- `apps/backend/app/exceptions/handler.ts` - modified `HttpExceptionHandler`
  - Normalize every thrown API failure into one RFC 9457 problem-details response shape.
  - Use the app-wide `handle(error, ctx)` path as the single translation point for API failures instead of letting the current ad hoc `errors` envelope escape.
  - Reshape the known API failure classes that currently bypass the generic path, including validation, authorization, unauthenticated, invalid-credentials, not-found, conflict, and illegal-transition style failures.
  - Preserve the production-safe handler behavior for non-API or unexpected errors by falling through to `super.handle(error, ctx)`.
  - Keep the response contract consistent across the API surface by deriving the problem-details status and title from the thrown exception rather than from endpoint-specific code.
  - Carry validation detail as problem-details extensions rather than switching back to a separate validation-only envelope.
  - Keep the handler as the only place that knows about the RFC 9457 serialization shape; controllers continue to throw exceptions and stay unaware of the response format.

- `apps/backend/tests/functional/applications/*.spec.ts` - modified existing functional coverage
  - Update the existing failure assertions in the application journey suites to expect the RFC 9457 problem-details shape instead of `{ errors: [...] }`.
  - Cover at least one representative failure from each major category already exercised by the suite: validation, authorization, not found, conflict, and workflow-transition rejection.
  - Assert both the status code and the problem-details body fields so the contract is pinned at the API boundary, not just via incidental message text.
  - Reuse the existing request setup in the current application specs rather than creating a separate error-only test harness.

## Test plan

- Validate that a failed request returns the RFC 9457 shape with `status`, `title`, `detail`, and `type` fields plus any required extension data.
- Validate that validation failures still surface field-level detail, but only through the problem-details envelope.
- Validate that auth, not-found, and conflict failures all share the same top-level shape even though their status codes differ.
- Validate that unexpected exceptions still fall back to the framework handler path instead of being forced into a misleading API response.
