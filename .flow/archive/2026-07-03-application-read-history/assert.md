# Application Read History — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/application-read-history/blueprint.md
> Date: 2026-07-03

## Summary

This change is covered by functional tests on the existing applicant application list and detail surfaces.

## Scope inventory

This is the **scope inventory** for this change — every behavior the change makes observable, with a coverage decision per row. It is **not** the test list. Tests are authored per surface in Step 2.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Unauthenticated GET applicant applications index → 401 | keep | tests/functional/applications/index.spec.ts: rejects unauthenticated requests to the applications index (401) |
| Authenticated applicant sees only their own applications in a paginated newest-first list | keep | tests/functional/applications/index.spec.ts: lists only the authenticated applicant's own applications with pagination metadata |
| Authenticated applicant sees an empty paginated collection when they have no applications | keep | tests/functional/applications/index.spec.ts: returns an empty paginated collection when the applicant has no applications |
| Unauthenticated GET applicant applications show → 401 | keep | tests/functional/applications/show.spec.ts: rejects unauthenticated requests to view an application (401) |
| Authenticated applicant sees an owned draft application as a wrapped resource | change | tests/functional/applications/show.spec.ts: shows an owned draft application and returns the wrapped resource (200) |
| Authenticated applicant sees an owned submitted application with ordered status-transition history | change | tests/functional/applications/show.spec.ts: shows an owned submitted application with the ordered history array (200) |
| Foreign or non-existent application on show → 404 | keep | tests/functional/applications/show.spec.ts: returns 404 for a foreign or non-existent application |

## Test list

T1 [functional] - shows an owned draft application and returns the wrapped resource

Outcome: 200; wrapped `data` body includes the owned application fields and an empty `history` / `statusTransitions` payload when no transitions exist.

T2 [functional] - shows an owned submitted application with the ordered status-transition history

Outcome: 200; wrapped `data` body includes the application fields and the transition history in chronological order, with the oldest transition first.

T3 [functional] - returns 404 for a foreign or non-existent application

Outcome: 404 for both a foreign owned record and a missing id.

T4 [functional] - lists only the authenticated applicant's own applications with pagination metadata

Outcome: 200; wrapped paginated body includes only applicant-owned rows, newest-first ordering, and stable metadata.

T5 [functional] - returns an empty paginated collection when the applicant has no applications

Outcome: 200; wrapped paginated body contains an empty `data` array and zero-count metadata.

## Cross-surface reconciliation

No cross-surface drops.

## Factories + fakes audit

| Test | Factory | Existing / New |
| ---- | ------- | -------------- |
| T1 | `ApplicationFactory`, `UserFactory` | Existing |
| T2 | `ApplicationFactory`, `UserFactory`, `ApplicationAuditLogEntryFactory` | Existing |
| T3 | `ApplicationFactory`, `UserFactory` | Existing |
| T4 | `ApplicationFactory`, `UserFactory` | Existing |
| T5 | `UserFactory` | Existing |

| Test | Fake / swap | Binding + file |
| ---- | ----------- | -------------- |
| T1 | None | _n/a_ |
| T2 | None | _n/a_ |
| T3 | None | _n/a_ |
| T4 | None | _n/a_ |
| T5 | None | _n/a_ |

## Runner-model risk scan

No runner-model violations identified.
