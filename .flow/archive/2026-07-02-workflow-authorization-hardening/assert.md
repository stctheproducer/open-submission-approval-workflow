# Workflow Authorization Hardening — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/workflow-authorization-hardening/blueprint.md
> Date: 2026-07-02

## Summary

This plan covers applicant ownership enforcement, reviewer-only workflow access, assignment-aware review decisions, and the conflict behavior of the existing workflow surface. It proves the authorization boundary stays strict while workflow success paths continue to work.

## Pre-implementation requirements

_None._

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is **not** the test list.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Applicant-owned surfaces stay limited to the owning applicant | keep | `tests/functional/applications/submissions.spec.ts: rejects foreign or non-existent application`; `tests/functional/applications/draft_reopenings.spec.ts: rejects a non-owner applicant from reopening an application` |
| Reviewer actions stay limited to reviewers | keep | `tests/functional/applications/reviewer.spec.ts: rejects non-reviewer users from the reviewer queue`; `tests/functional/applications/reviewer.spec.ts: rejects non-reviewer users from starting review` |
| In-review decisions stay limited to the assigned reviewer | keep | `tests/functional/applications/approvals.spec.ts: rejects an unassigned reviewer from approving an application`; `tests/functional/applications/rejections.spec.ts: rejects an unassigned reviewer from rejecting an application`; `tests/functional/applications/change_requests.spec.ts: rejects an unassigned reviewer from requesting changes` |
| Conflicting workflow attempts are rejected as real conflicts | keep | `tests/functional/applications/workflow_conflicts.spec.ts: rejects stale workflow transitions with a consistent 409 conflict response across all main routes`; `tests/functional/applications/approvals.spec.ts: rejects approval of a non-eligible application with a conflict error (409)`; `tests/functional/applications/rejections.spec.ts: rejects a non-eligible application with a conflict error (409)`; `tests/functional/applications/change_requests.spec.ts: rejects a change request on a non-eligible application with a conflict error (409)`; `tests/functional/applications/draft_reopenings.spec.ts: rejects reopening a non-eligible application with a conflict error (409)` |
| Validation failures on reviewer comment inputs return 422 and field errors | keep | `tests/functional/applications/rejections.spec.ts: rejects a missing or blank comment with field-level validation errors`; `tests/functional/applications/change_requests.spec.ts: rejects invalid comment payloads with field-level validation errors` |

## Test list (ordered)

Reads: testing.md

1. T1 [functional] — rejects a non-owner from applicant-owned workflow surfaces
2. T2 [functional] — rejects a non-reviewer from reviewer-only workflow surfaces
3. T3 [functional] — rejects a reviewer who is not assigned to the application
4. T4 [functional] — rejects stale workflow transitions with the shared conflict envelope
5. T5 [functional] — preserves 422 validation failures for reviewer comment inputs

## Per-test contracts

Reads: testing.md

### Test 1 — rejects a non-owner from applicant-owned workflow surfaces

- **Surface:** application_submissions_controller.store / application_draft_reopenings_controller.store
- **Suite:** functional
- **Setup:**
  - Factories: UserFactory, ApplicationFactory
  - Fakes: none
  - Auth: signed-in applicant who does not own the target application
  - Other: use a foreign application for submission and reopening attempts
- **Action:** POST the applicant submission and draft-reopening routes for a foreign application
- **Outcome contract:**
  - Status: 404 for foreign applicant-owned access attempts
  - Body: shared error contract body from the exception handler
  - DB / fake / exception assertions: no application state changes; the foreign application remains unchanged
- **Does NOT assert:** successful applicant submission or reopening behavior
- **Why:** the controller boundary must keep applicant-owned surfaces limited to the owning applicant

### Test 2 — rejects a non-reviewer from reviewer-only workflow surfaces

- **Surface:** application_review_starts_controller.store / application_approvals_controller.store / application_rejections_controller.store / application_change_requests_controller.store / reviewer_applications_controller.index / reviewer_applications_controller.show
- **Suite:** functional
- **Setup:**
  - Factories: UserFactory, ApplicationFactory
  - Fakes: none
  - Auth: signed-in applicant
  - Other: target a submitted or under-review application as needed by the surface
- **Action:** exercise the reviewer queue, review-start, approval, rejection, and change-request routes as an applicant
- **Outcome contract:**
  - Status: 403 for reviewer-only entry points
  - Body: shared error contract body from the exception handler
  - DB / fake / exception assertions: no workflow state changes
- **Does NOT assert:** assigned-reviewer checks or conflict behavior
- **Why:** reviewer role checks remain a hard entry-point boundary across the reviewer surface

### Test 3 — rejects a reviewer who is not assigned to the application

- **Surface:** application_approvals_controller.store / application_rejections_controller.store / application_change_requests_controller.store / reviewer_applications_controller.show
- **Suite:** functional
- **Setup:**
  - Factories: UserFactory, ApplicationFactory
  - Fakes: none
  - Auth: reviewer signed in with a different reviewer assigned to the application
  - Other: use an under-review application assigned to another reviewer
- **Action:** attempt approval, rejection, and change request on the assigned application as the wrong reviewer
- **Outcome contract:**
  - Status: 403 or 404 according to the current application policy contract
  - Body: shared error contract body from the exception handler
  - DB / fake / exception assertions: the application remains assigned to the original reviewer and unchanged
- **Does NOT assert:** successful in-review decisions by the assigned reviewer
- **Why:** reviewer role alone is not enough; assignment must also match before a decision can proceed

### Test 4 — rejects stale workflow transitions with the shared conflict envelope

- **Surface:** application_submissions_controller.store / application_review_starts_controller.store / application_approvals_controller.store / application_rejections_controller.store / application_change_requests_controller.store / application_draft_reopenings_controller.store
- **Suite:** functional
- **Setup:**
  - Factories: UserFactory, ApplicationFactory, ApplicationAuditEntryFactory, ApplicationStatusTransitionFactory
  - Fakes: none
  - Auth: signed-in applicant or reviewer, depending on the surface
  - Other: prepare each application in the already-invalid state for that action
- **Action:** attempt each stale workflow transition on its matching route
- **Outcome contract:**
  - Status: 409
  - Body: shared error contract body from the exception handler
  - DB / fake / exception assertions: no workflow state changes; the existing state remains intact
- **Does NOT assert:** validation failures or authorization failures
- **Why:** the workflow must treat invalid state transitions as real conflicts instead of silently accepting them

### Test 5 — preserves 422 validation failures for reviewer comment inputs

- **Surface:** application_rejections_controller.store / application_change_requests_controller.store
- **Suite:** functional
- **Setup:**
  - Factories: UserFactory, ApplicationFactory
  - Fakes: none
  - Auth: assigned reviewer signed in
  - Other: send missing, blank, and overlong comment payloads where those validators apply
- **Action:** POST invalid comment payloads to the reviewer comment routes
- **Outcome contract:**
  - Status: 422
  - Body: shared validation error envelope with field errors
  - DB / fake / exception assertions: no audit entry or workflow state change is written
- **Does NOT assert:** conflict behavior or assignment failures
- **Why:** reviewer comment validation is part of the public API contract and must remain stable

## Factories audit

Reads: testing.md

- UserFactory — existing — used by T1, T2, T3, T4, T5.
- ApplicationFactory — existing — used by T1, T2, T3, T4, T5.
- ApplicationAuditEntryFactory — existing — used by T4.
- ApplicationStatusTransitionFactory — existing — used by T4.

## Fakes audit

Reads: testing.md

None identified.

## Order rationale

Applicant-owned rejection comes first because it is the narrowest ownership boundary, followed by reviewer-role rejection, then assignment-aware access, then conflict and validation contracts.

## Runner-model risks

Reads: testing.md

None identified.

## Open questions

None.

