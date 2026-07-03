# Session Login Seed — Test Plan

> Stack: AdonisJS API
> Source: `.flow/changes/session-login-seed/blueprint.md`
> Date: 2026-07-03

## Summary

This plan covers the browser sign-in flow moving to the web guard, the role-bearing authenticated-user payload, and the protected profile lookup that returns the same shape after a session login. It keeps the tests focused on observable HTTP outcomes and the authenticated-user contract the frontend needs for role-based landing.

## Pre-implementation requirements

None.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Seeded applicant login returns a role-bearing authenticated user payload and establishes a browser session | change | `apps/backend/tests/functional/auth/session_login_seed.spec.ts: signs in a seeded applicant through the shared session login and logs out` |
| Seeded reviewer login returns a role-bearing authenticated user payload and establishes a browser session | change | `apps/backend/tests/functional/auth/session_login_seed.spec.ts: signs in a seeded reviewer through the shared session login and logs out` |
| Logging out through the browser session ends the signed-in session | change | `apps/backend/tests/functional/auth/session_login_seed.spec.ts: signs in a seeded applicant through the shared session login and logs out` |
| Invalid credentials reject sign-in and leave the person signed out | add | — |
| Missing role information rejects sign-in and leaves the person signed out | skip | Not economically reachable with the current non-null role model without stubbing our own auth path. |
| Authenticated profile lookup returns the same role-bearing user shape after a session login | add | — |
| Seeded applicant and reviewer accounts exist for local sign-in testing | keep | `apps/backend/tests/functional/auth/session_login_seed.spec.ts: seeds one applicant and one reviewer for local sign-in testing` |
| Applicant lands in the applicant area after sign-in | keep | `apps/frontend/src/App.test.tsx:sends an applicant to the applicant workspace and loads their applications` |
| Reviewer lands in the reviewer area after sign-in | keep | `apps/frontend/src/App.test.tsx:sends a reviewer to the reviewer area` |
| Unauthenticated users stay on the sign-in page | keep | `apps/frontend/src/App.test.tsx:keeps unauthenticated users on the sign-in page` |
| Applicants stay out of the reviewer area | keep | `apps/frontend/src/App.test.tsx:keeps an applicant out of the reviewer area` |

## Test list (ordered)

Reads: testing.md

### T1 [functional] — signs in seeded users through the shared session login and returns the authenticated user with role

- Setup: seed one applicant and one reviewer through `SessionLoginSeeder`; use the built-in session auth client; no custom fakes or swaps.
- Action: `POST /api/v1/auth/login` with valid applicant credentials, then repeat with valid reviewer credentials.
- Outcome contract:
  - status `200` for each row.
  - response body is the unwrapped action payload from the login surface.
  - response body includes `user.email` and `user.role` for the signed-in account.
  - the applicant row asserts `role: 'applicant'`; the reviewer row asserts `role: 'reviewer'`.
  - the payload does not contain an access token.
- Does NOT assert:
  - route internals, controller class names, or how the session is stored.
  - logout behavior.
  - profile lookup behavior.
- Why: this is the primary browser sign-in contract the frontend depends on for immediate role-based landing.

### T2 [functional] — rejects invalid credentials without signing the user in

- Setup: no authenticated session; use the session auth client; no custom fakes or swaps.
- Action: `POST /api/v1/auth/login` with an incorrect password for a seeded user.
- Outcome contract:
  - status `400`.
  - response body matches the existing auth problem-details envelope.
  - the response does not include a signed-in user payload.
- Does NOT assert:
  - logout behavior.
  - the exact login field ordering in the request body.
  - any session-cookie internals.
- Why: the sign-in surface must reject bad credentials cleanly before the frontend can treat the user as authenticated.

### T3 [functional] — returns the current authenticated user with role after a web-session login

- Setup: seed or create one applicant user, authenticate it through the web guard, and reuse the same signed-in session for the request; no custom fakes or swaps.
- Action: `GET /api/v1/account/profile` as the authenticated user.
- Outcome contract:
  - status `200`.
  - response body is wrapped under `data`.
  - response body includes the authenticated user fields the frontend consumes, including `email` and `role`.
  - the response shape matches the login user payload contract.
- Does NOT assert:
  - login behavior.
  - logout behavior.
  - any profile-editing or persistence behavior.
- Why: the protected profile lookup must return the same authenticated-user shape after a session login so the frontend can rehydrate the current role reliably.

### T4 [functional] — rejects unauthenticated profile lookup

- Setup: no authenticated session; no custom fakes or swaps.
- Action: `GET /api/v1/account/profile` without login.
- Outcome contract:
  - status `401`.
  - response body matches the existing auth problem-details envelope.
- Does NOT assert:
  - login behavior.
  - logout behavior.
  - any body shape beyond the auth failure contract.
- Why: the profile surface is protected and must not leak the authenticated-user payload to anonymous clients.

## Runner-model risk scan

- No runner-model risks identified.
- The plan uses sequential functional tests, isolates state with the existing group truncation pattern in the current auth test file, and avoids cross-test state leakage.
