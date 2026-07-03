---
planned: 2026-07-03
---

# Session Login Seed — Implementation Plan

> Task type: modification
> Stack: AdonisJS API
> Database: PostgreSQL

## Summary

Replace the browser sign-in flow with a session-backed login/logout contract and return a role-bearing authenticated user payload so the frontend can land the user in the correct area immediately after sign-in. Keep the existing protected app areas gated by the web guard.

## Current shape

- `apps/backend/config/auth.ts` already defines both an `api` token guard and a `web` session guard, but the browser login flow still routes through the token path.
- `apps/backend/start/routes.ts` sends `POST /api/v1/auth/login` and `POST /api/v1/account/logout` to `AccessTokensController`.
- `apps/backend/app/controllers/access_tokens_controller.ts` verifies credentials, creates an access token, returns `{ user, token }`, and invalidates the current access token on logout.
- `apps/backend/app/controllers/profile_controller.ts` returns the current user through `UserTransformer`, which does not expose `role`.
- `apps/frontend/src/App.tsx` and `apps/frontend/src/routing/access-policy.tsx` already branch on `currentRole`, so the frontend contract needs the authenticated user role immediately after sign-in.
- `apps/backend/tests/functional/auth/session_login_seed.spec.ts` still asserts token-based login behavior and manually calls the token logout controller.

## Target shape

- Browser sign-in and sign-out use the `web` guard only.
- `POST /api/v1/auth/login` completes a session login and returns the authenticated user, including `role`, so the frontend can decide whether to land in the applicant or reviewer area.
- `POST /api/v1/account/logout` ends the browser session instead of invalidating an access token.
- The authenticated-user payload used by login and profile endpoints includes the role without changing the existing general-purpose user transformer.
- The protected applicant and reviewer areas remain gated by the web guard, so a successful login can immediately feed the role-based landing logic already present in the frontend.

## Authorization + segregation

Reads: authentication.md, authorization.md

- No new policy classes or standalone abilities are needed.
- No new permission keys are introduced.
- Route segregation stays at the entry points:
  - `/api/v1/account/*`, `/api/v1/applicant/*`, and `/api/v1/reviewer/*` remain protected with the `web` guard.
  - `/api/v1/auth/login` stays public and uses the session guard only inside the controller action.
- Query segregation: none.

## Controllers

Reads: controllers.md, authentication.md, session.md, response.md

`cd apps/backend && node ace make:controller sessions`

- `apps/backend/app/controllers/sessions_controller.ts` (new).
  - `store` — wiring: `loginValidator`, `User.verifyCredentials`, `auth.use('web').login`, `AuthenticatedUserTransformer`, `serialize.withoutWrapping`.
    - Validate before credential verification.
    - Refuse to complete sign-in if the authenticated user record does not carry a role, because the frontend landing decision depends on that value.
    - Do not issue access tokens in the browser sign-in path.
  - `destroy` — wiring: `auth.use('web').logout`, `serialize.withoutWrapping`.
    - The existing `/account` route group keeps the action behind the web guard.
- `apps/backend/app/controllers/profile_controller.ts` (modified).
  - `show` — wiring: `auth.getUserOrFail`, `AuthenticatedUserTransformer`, `serialize`.
    - Return the same authenticated-user shape as sign-in so the frontend can hydrate the current user consistently after refresh.
- DI: none.
- Per-action middleware overrides: none.

## Response layer

Reads: transformers.md, response.md, exception-handling.md

`cd apps/backend && node ace make:transformer authenticated_user`

- `apps/backend/app/transformers/authenticated_user_transformer.ts` — `AuthenticatedUserTransformer`.
  - Pass-through fields: `id`, `fullName`, `email`, `role`, `createdAt`, `updatedAt`, `initials`.
  - Relationships to preload: none.
  - Runtime context required: none.
- `apps/backend/app/controllers/sessions_controller.ts`
  - Wrapping mode: `serialize.withoutWrapping`.
  - Success status: `200`.
  - Success shape:
    - `store` returns `{ user: <authenticated user> }`.
    - `destroy` returns `{ message: 'Logged out successfully' }`.
  - Recoverable errors:
    - Invalid credentials or missing role information: `400` through the auth invalid-credentials path.
    - Validation failure on the login payload: `422` through the existing validator exception handling.
  - Self-handled exceptions thrown: `E_INVALID_CREDENTIALS`.
- `apps/backend/app/controllers/profile_controller.ts`
  - Wrapping mode: `serialize`.
  - Success status: `200`.
  - Success shape: a single authenticated user resource under `data`.
  - Recoverable errors: unauthorized access remains handled by the existing auth middleware and global auth exception handler.
  - Self-handled exceptions thrown: none.

## Routes

Reads: routing.md

```diff title="apps/backend/start/routes.ts"
@@
     router
       .group(() => {
         router.post('signup', [controllers.NewAccount, 'store'])
-        router.post('login', [controllers.AccessTokens, 'store'])
+        router.post('login', [controllers.Sessions, 'store'])
       })
       .prefix('auth')
       .as('auth')
@@
     router
       .group(() => {
         router.get('profile', [controllers.Profile, 'show'])
-        router.post('logout', [controllers.AccessTokens, 'destroy'])
+        router.post('logout', [controllers.Sessions, 'destroy'])
       })
       .prefix('account')
       .as('profile')
       .use(middleware.auth({ guards: ['web'] }))
 ```

Verify route names with `cd apps/backend && node ace list:routes`.

## Events + side effects

Reads: none

_None._

## Test coverage gap

`apps/backend/tests/functional/auth/session_login_seed.spec.ts` still models the flow as token-based, so it needs to be rewritten around the web guard. The new coverage should prove that a seeded applicant and reviewer can sign in through `/api/v1/auth/login`, receive a role-bearing user payload, reach the correct app area through the browser session, and sign out through `/api/v1/account/logout`. Existing frontend route tests already cover the `currentRole` landing behavior directly; they do not need structural changes unless the login bootstrap is wired in this slice.
