# Application Option Sets — Blueprint

> Stack: AdonisJS API
> Source: `.flow/changes/application-option-sets/brief.md`
> Date: 2026-07-03
> Built: 2026-07-03

## Summary

`Reads: controllers.md, response.md, validation.md, authentication.md, testing.md`

The draft journey gets a backend-owned category option set from a dedicated read endpoint, and the draft create/update validators use that same source of truth to reject unsupported categories. No schema or model changes are needed.

## Pre-implementation requirements

None.

## Controller layout

`Reads: controllers.md`

- `apps/backend/app/controllers/application_option_sets_controller.ts` — new
  - `index` returns the current category option set for authenticated applicants.

## Service design

None.

## Validation rules

`Reads: validation.md`

- `apps/backend/app/validators/application.ts` — modified
  - `createApplicationValidator` keeps the existing draft fields and adds `category` as an optional nullable enum backed by the backend-owned category option set.
  - `updateApplicationValidator` keeps the existing draft fields and adds the same `category` restriction so edits cannot drift away from the shared option set.
- `apps/backend/app/values/application_category_options.ts` — new
  - Exports the shared category option tuple used by both the validator and the read endpoint.

## Authz + segregation

`Reads: authentication.md, authorization.md`

- `apps/backend/start/routes.ts` keeps the endpoint inside the applicant-authenticated route group.
- No policy is needed.
- The route remains unavailable to unauthenticated clients by virtue of the existing applicant auth middleware.

## Controllers

`Reads: controllers.md, response.md`

- `apps/backend/app/controllers/application_option_sets_controller.ts` — new
  - `index`
    - Reads the backend-owned category option tuple.
    - Returns a wrapped collection of option objects through `serialize(...)`.
    - Keeps the payload simple and stable so the frontend can use it directly in the draft form.

## Response layer

`Reads: response.md`

- `apps/backend/app/controllers/application_option_sets_controller.ts` — new
  - `index` returns a pageless collection response shaped as `{ data: [...] }`.
  - Each option item exposes the backend-owned category value and its display label from the same source tuple.

## Routes

`Reads: controllers.md`

- `apps/backend/start/routes.ts` — modified
  - Adds a new authenticated applicant GET route for the category option set.
  - Route name should follow the existing applicant namespace conventions so typed tests can call it through `client.visit(...)`.

## Events + side effects

None.

## Testing

`Reads: testing.md`

- `apps/backend/tests/functional/applications/option_sets.spec.ts` — new
  - Proves authenticated applicants can fetch the shared category option set.
  - Proves unauthenticated callers are rejected.
  - Proves the response is wrapped as a collection and reflects the current backend-owned options.
- `apps/backend/tests/functional/applications/store.spec.ts` — change
  - Adds coverage that an unsupported category is rejected by the create validator.
- `apps/backend/tests/functional/applications/update.spec.ts` — change
  - Adds coverage that an unsupported category is rejected by the update validator.

## Out of scope

- Additional option sets beyond category.
- Frontend wiring.
- Any schema migration for the application category column.
