# Session Login Seed — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/session-login-seed/blueprint.md
> Date: 2026-07-02

## Summary

This plan covers the shared session login and logout flow for seeded applicant and reviewer identities. It proves the development dataset is usable and that the shared auth path works for both roles.

## Pre-implementation requirements

_None._

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is **not** the test list.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Shared session login accepts an applicant identity | add | — |
| Shared session login accepts a reviewer identity | add | — |
| Shared session login rejects invalid credentials | keep | `tests/functional/auth/login.spec.ts` |
| Shared session logout succeeds for a signed-in user | add | — |
| Development seed includes one applicant and one reviewer | add | — |

## Test list (ordered)

Reads: testing.md

1. T1 [functional] — signs in an applicant through the shared session login and logs out
2. T2 [functional] — signs in a reviewer through the shared session login and logs out
3. T3 [functional] — seeds one applicant and one reviewer for local sign-in testing

## Per-test contracts

Reads: testing.md

### Test 1 — signs in an applicant through the shared session login and logs out

- **Surface:** access_tokens_controller.store / access_tokens_controller.destroy
- **Suite:** functional
- **Setup:**
  - Factories: UserFactory
  - Fakes: none
  - Auth: session guard login for the logout request
  - Other: seeded applicant credentials available for the login request
- **Action:** POST the shared login route with the applicant credentials, then POST the shared logout route as the signed-in applicant
- **Outcome contract:**
  - Status: 200 for login, 200 for logout
  - Body: login response contains the transformed applicant user and a token value; logout response contains the logout success message
  - DB / fake / exception assertions: the signed-in applicant is accepted by the shared auth path
- **Does NOT assert:** frontend redirect behavior, role-landing behavior, or any route outside the shared auth entry point
- **Why:** this is the main applicant path proving the shared session auth flow works for a real applicant identity

### Test 2 — signs in a reviewer through the shared session login and logs out

- **Surface:** access_tokens_controller.store / access_tokens_controller.destroy
- **Suite:** functional
- **Setup:**
  - Factories: UserFactory
  - Fakes: none
  - Auth: session guard login for the logout request
  - Other: seeded reviewer credentials available for the login request
- **Action:** POST the shared login route with the reviewer credentials, then POST the shared logout route as the signed-in reviewer
- **Outcome contract:**
  - Status: 200 for login, 200 for logout
  - Body: login response contains the transformed reviewer user and a token value; logout response contains the logout success message
  - DB / fake / exception assertions: the signed-in reviewer is accepted by the shared auth path
- **Does NOT assert:** frontend redirect behavior, role-landing behavior, or any route outside the shared auth entry point
- **Why:** this is the reviewer path proving the shared session auth flow works for a real reviewer identity

### Test 3 — seeds one applicant and one reviewer for local sign-in testing

- **Surface:** database seeding / development setup
- **Suite:** functional
- **Setup:**
  - Factories: UserFactory
  - Fakes: none
  - Auth: none
  - Other: run the development seed and inspect the resulting user rows
- **Action:** execute the seed flow, then inspect the resulting user records
- **Outcome contract:**
  - Status: seed completes successfully
  - Body: n/a
  - DB / fake / exception assertions: one applicant user exists and one reviewer user exists with the documented development access details
- **Does NOT assert:** login route behavior, logout behavior, or any workflow surface
- **Why:** the seeded identities are the prerequisite that makes the shared auth flow testable in development

## Factories audit

Reads: testing.md

- UserFactory — existing — used by T1, T2, T3.

## Fakes audit

Reads: testing.md

None identified.

## Order rationale

The login/logout tests come before the seed inspection because they prove the runtime auth path first, while the seed test simply verifies the setup data that those login tests depend on.

## Runner-model risks

Reads: testing.md

None identified.

## Open questions

None.

