# Error Contract Proofing — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/error-contract-proofing/blueprint.md
> Date: 2026-07-02

## Summary

This plan proves the workflow API returns one shared error contract for validation, forbidden, not-found, and conflict failures. It keeps the focus on observable failure responses rather than implementation details.

## Pre-implementation requirements

_None._

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is **not** the test list.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Validation failures on reviewer comment inputs return 422 and field errors | keep | `tests/functional/applications/rejections.spec.ts: rejects a missing or blank comment with field-level validation errors`; `tests/functional/applications/change_requests.spec.ts: rejects invalid comment payloads with field-level validation errors` |
| Forbidden workflow failures use the shared error contract | keep | `tests/functional/applications/reviewer.spec.ts: rejects non-reviewer users from the reviewer queue`; `tests/functional/applications/reviewer.spec.ts: rejects non-reviewer users from starting review`; `tests/functional/applications/approvals.spec.ts: rejects non-reviewer users from approving an application`; `tests/functional/applications/rejections.spec.ts: rejects non-reviewer users from rejecting an application`; `tests/functional/applications/change_requests.spec.ts: rejects non-reviewer users from requesting changes` |
| Not-found workflow failures use the shared error contract | keep | `tests/functional/applications/submissions.spec.ts: returns 404 when submitting a foreign or non-existent application`; `tests/functional/applications/reviewer.spec.ts: returns 404 for an inaccessible application`; `tests/functional/applications/reviewer.spec.ts: returns 404 for a non-existent application`; `tests/functional/applications/change_requests.spec.ts: returns 404 for a non-existent application`; `tests/functional/applications/draft_reopenings.spec.ts: returns 404 for a non-existent application` |
| Conflict failures use the shared error contract | keep | `tests/functional/applications/workflow_conflicts.spec.ts: conflict response envelope matches the same shape used by validation, authorization, and not-found failures` |

## Test list (ordered)

Reads: testing.md

1. T1 [functional] — returns the shared error envelope for validation, forbidden, not-found, and conflict failures
2. T2 [functional] — preserves the shared error envelope on representative workflow routes

## Per-test contracts

Reads: testing.md

### Test 1 — returns the shared error envelope for validation, forbidden, not-found, and conflict failures

- **Surface:** application_submissions_controller.store / application_review_starts_controller.store / application_approvals_controller.store / application_rejections_controller.store / application_change_requests_controller.store / application_draft_reopenings_controller.store
- **Suite:** functional
- **Setup:**
  - Factories: UserFactory, ApplicationFactory
  - Fakes: none
  - Auth: applicant or reviewer, depending on the case
  - Other: build one request for each failure type using the existing workflow routes
- **Action:** send representative invalid, forbidden, missing, and stale-state requests across the workflow routes
- **Outcome contract:**
  - Status: 422 for validation, 403 or 404 for access failures, 409 for conflicts
  - Body: every failure response uses the shared `{ errors: [...] }` envelope
  - DB / fake / exception assertions: no failure mutates workflow state
- **Does NOT assert:** success-path body shapes or frontend behavior
- **Why:** this is the user-visible API contract that all workflow failures must share

### Test 2 — preserves the shared error envelope on representative workflow routes

- **Surface:** application_rejections_controller.store / application_change_requests_controller.store / workflow_conflicts surface
- **Suite:** functional
- **Setup:**
  - Factories: UserFactory, ApplicationFactory
  - Fakes: none
  - Auth: signed-in reviewer and applicant as needed
  - Other: exercise one validation case, one forbidden case, one not-found case, and one conflict case
- **Action:** send one representative failure request per category
- **Outcome contract:**
  - Status: each response uses the expected failure status for its category
  - Body: each response exposes the same shared error envelope shape
  - DB / fake / exception assertions: the affected application records remain unchanged
- **Does NOT assert:** exact wording beyond the shared envelope contract
- **Why:** the contract needs to stay stable across the workflow routes the frontend depends on

## Factories audit

Reads: testing.md

- UserFactory — existing — used by T1, T2.
- ApplicationFactory — existing — used by T1, T2.

## Fakes audit

Reads: testing.md

None identified.

## Order rationale

The first test locks the envelope across all failure categories, and the second keeps the representative route coverage explicit without duplicating the same contract shape.

## Runner-model risks

Reads: testing.md

None identified.

## Open questions

None.

