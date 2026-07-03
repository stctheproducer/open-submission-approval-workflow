# Reviewer Application Detail — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/reviewer-application-detail/blueprint.md
> Date: 2026-07-03

## Summary

This plan covers the reviewer application detail endpoint and the history payload it returns. It locks the detail-view shape and the access rules that keep unauthorized users out of the review surface.

## Pre-implementation requirements

_None._

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| ------------------- | -------- | ----- |
| The reviewer detail view returns the combined detail payload | keep | tests/functional/applications/reviewer.spec.ts:shows an application detail with the reviewer-detail variant (200) |
| Non-reviewer users are forbidden from viewing the reviewer detail view | keep | tests/functional/applications/reviewer.spec.ts:rejects non-reviewer users from viewing an application (403) |
| An inaccessible application returns 404 from the reviewer detail view | keep | tests/functional/applications/reviewer.spec.ts:returns 404 for an inaccessible application (404) |

## Test list (ordered)

Reads: testing.md

1. `T1 [functional]` - shows an application detail with the reviewer-detail variant (200)
2. `T2 [functional]` - rejects non-reviewer users from viewing an application (403)
3. `T3 [functional]` - returns 404 for an inaccessible application (404)

## Per-test contracts

Reads: testing.md

### Test 1 — shows an application detail with the reviewer-detail variant (200)

- **Surface:** `ReviewerApplicationsController.show`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory`, `ApplicationFactory`, `ApplicationStatusTransitionFactory`
  - Fakes: none
  - Auth: signed-in reviewer
  - Other: create an under-review application assigned to the reviewer and seed its initial transition history
- **Action:** `GET reviewer.applications.show` for the application id
- **Outcome contract:**
  - Status: 200
  - Body: detailed application payload with `applicant`, `assignedReviewer`, `reviewState = owned`, `statusTransitions.length === 1`, and `history.length === 1`
  - DB / fake / exception assertions: none beyond the response body
- **Does NOT assert:** queue-list behavior, approval behavior, or any mutation of application rows
- **Why:** the reviewer detail view must expose the current record and its history together

### Test 2 — rejects non-reviewer users from viewing an application (403)

- **Surface:** `ReviewerApplicationsController.show`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory`, `ApplicationFactory`
  - Fakes: none
  - Auth: signed-in web user who is not a reviewer
  - Other: create an application owned by another user
- **Action:** `GET reviewer.applications.show` for the target application id
- **Outcome contract:**
  - Status: 403
  - Body: Problem Details error envelope for forbidden access
  - DB / fake / exception assertions: `assertProblemDetails(response.body(), 403)`
- **Does NOT assert:** detail payload shape, history shape, or any row state
- **Why:** reviewer-only surfaces must reject non-reviewer users before exposing application data

### Test 3 — returns 404 for an inaccessible application (404)

- **Surface:** `ReviewerApplicationsController.show`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory`, `ApplicationFactory`
  - Fakes: none
  - Auth: signed-in reviewer
  - Other: create a draft application that is not visible to the reviewer surface
- **Action:** `GET reviewer.applications.show` for the target application id
- **Outcome contract:**
  - Status: 404
  - Body: Problem Details error envelope for not found
  - DB / fake / exception assertions: `assertProblemDetails(response.body(), 404)`
- **Does NOT assert:** queue contents, approved-state behavior, or any mutation of application rows
- **Why:** the reviewer detail surface must not expose applications outside the reviewer-visible queue

## Factories audit

Reads: testing.md

| Test | Factory | Existing / New |
| ---- | ------- | -------------- |
| T1 | UserFactory, ApplicationFactory, ApplicationStatusTransitionFactory | Existing |
| T2 | UserFactory, ApplicationFactory | Existing |
| T3 | UserFactory, ApplicationFactory | Existing |

## Fakes audit

Reads: testing.md

| Test | Fake / swap | Binding + file |
| ---- | ----------- | -------------- |
| T1 | none | n/a |
| T2 | none | n/a |
| T3 | none | n/a |

## Order rationale

The happy-path detail payload comes first because it defines the surface contract. The forbidden and not-found branches follow as access-control regressions on the same controller action.

## Runner-model risks

Reads: testing.md

None identified.

## Open questions

None.
