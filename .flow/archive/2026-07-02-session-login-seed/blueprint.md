---
planned: 2026-07-02
built: 2026-07-02
---

# Session Login Seed — Implementation Plan

> Task type: extension
> Stack: AdonisJS API
> Database: PostgreSQL

## Summary

Seed development identities for both supported roles and make the shared session login flow demonstrable end to end. This slice keeps the current auth model but makes the developer-facing entry path usable for applicant and reviewer testing.

## Pre-implementation requirements

_None._

## Out of scope

_None._

## Current shape

- `apps/backend/config/auth.ts` already defines both `api` token auth and `web` session auth.
- `apps/backend/app/controllers/access_tokens_controller.ts` already owns login and logout behavior for the shared auth entry point.
- `apps/backend/app/controllers/new_account_controller.ts` currently covers account creation, but there is no dedicated seeded developer identity path.
- `apps/backend/database/seeders` already exists as the natural home for development seed data.

## Target shape

The backend provides a repeatable development dataset with one applicant and one reviewer ready for sign-in. The shared session login flow works for both identities, and the repository documents the credentials needed to exercise each role during local development.

## Logical schema

Reads: models.md, migrations.md, schema-rules.md

_n/a (task type: extension)_

## Migrations + models

Reads: migrations.md, models.md

_n/a (task type: extension)_

## Service design

Reads: controllers.md

_n/a (task type: extension)_

## Validation

Reads: validation.md, vine/types

_n/a (task type: extension)_

## Authorization + segregation

Reads: authentication.md, authorization.md

_n/a (task type: extension)_

## Controllers

Reads: controllers.md, http-context.md, request.md, middleware.md, model-relationships.md

- `apps/backend/app/controllers/access_tokens_controller.ts` (modified).
  - `store` — wiring: existing session login, seeded applicant/reviewer credentials, shared auth entry point.
    - Keep the shared login contract unchanged while ensuring both seeded roles are usable.
  - `destroy` — wiring: existing session logout.
    - No change in behavior; the seeded flow only needs it available for the login/logout proof.

- DI: method.

## Response layer

Reads: transformers.md, response.md, exception-handling.md

_n/a (task type: extension)_

## Routes

Reads: routing.md

_n/a (task type: extension)_

## Events + side effects

Reads: n/a

_n/a (task type: extension)_

## Test coverage gap

Existing tests should already cover the auth controller shape. New coverage is needed for seeded applicant and reviewer login/logout using the shared session path, plus a small documentation check for the development credentials.
