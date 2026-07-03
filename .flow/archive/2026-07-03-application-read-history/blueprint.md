# Application Read History — Blueprint

> Stack: AdonisJS API
> Source: `.flow/changes/application-read-history/brief.md`
> Date: 2026-07-03
> Built: 2026-07-03

## Summary

`Reads: routing.md, controllers.md, response.md, pagination.md, transformers.md, authentication.md, authorization.md, testing.md`

Applicant read access stays on the existing `ApplicationsController` surface. The change tightens the detail payload so the applicant workspace and application detail both speak from the same application record, but the timeline comes only from status transitions. No new route surface is introduced.

## Pre-implementation requirements

None.

## Controller layout

- `apps/backend/app/controllers/applications_controller.ts` — modified
  - `index` keeps the existing applicant-owned paginated list route.
  - `show` keeps the existing applicant-owned detail route.
  - No new controller is needed.

## Service design

None.

## Validation rules

None.

## Authz + segregation

`Reads: authentication.md, authorization.md`

- `apps/backend/app/policies/application_policy.ts` already owns applicant ownership checks for `view`.
  - `view(user, application)` remains the ownership gate for the detail surface.
  - The controller keeps using the existing `auth.getUserOrFail()` + ownership-aware query shape.
- Query segregation stays at the controller/query layer.
  - `index` keeps filtering by `userId` and ordering newest-first with pagination.
  - `show` keeps filtering by both `id` and `userId` so foreign records resolve as not found.

## Controllers

`Reads: controllers.md, response.md, pagination.md, transformers.md`

- `apps/backend/app/controllers/applications_controller.ts` — modified
  - `index`
    - Uses the existing `ApplicationDraftService.listForUser(user.id, page, perPage)`.
    - Keeps `page` / `perPage` handling and pagination metadata.
    - Returns the existing wrapped collection response.
  - `show`
    - Switches the preload set to the status-transition relation needed by the detail timeline.
    - Returns the same wrapped single-resource response, but with timeline data limited to status transitions.
    - Keeps ownership filtering in the query so a foreign application still resolves as not found.

## Response layer

`Reads: response.md, transformers.md`

- `index` stays a paginated wrapped collection.
- `show` stays a wrapped single resource.
- The response shape for `history` / `statusTransitions` comes from the transformer, not from ad hoc controller shaping.

## Routes

`Reads: routing.md`

- No route changes.
- Existing routes remain:
  - `applicant.applications.index`
  - `applicant.applications.show`

## Events + side effects

None.

## Testing

`Reads: testing.md`

- `apps/backend/tests/functional/applications/index.spec.ts` — keep
  - Existing coverage already proves applicant-only pagination and newest-first ordering.
- `apps/backend/tests/functional/applications/show.spec.ts` — change
  - The owned draft detail test continues to assert the wrapped resource and ownership.
  - The submitted-detail test shifts to assert the status-transition history payload only, in chronological order.
  - The foreign / non-existent cases stay as 404 coverage.
- Add one focused detail test if needed for a draft with no status transitions.
  - Purpose: prove the detail view still returns the owned application and an empty timeline when no transitions exist.

## Out of scope

- Draft editing behavior.
- Submission behavior beyond the history it already writes.
- Requested-changes reopening.
- Backend-owned option sets.
- Attachment uploads.
