# Application Draft Reopening — Test Plan

> Stack: AdonisJS API
> Source: `.flow/changes/application-draft-reopening/blueprint.md`
> Date: 2026-07-03

## Summary

This plan covers reopening a requested-changes application back to draft on the same record. It locks the ownership gate, the eligible reopen path, and the conflict and not-found failures already present on the route.

## Pre-implementation requirements

None.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| ------------------- | -------- | ----- |
| Eligible changes-requested application reopens to draft for the owner | keep | `tests/functional/applications/draft_reopenings.spec.ts:reopens an eligible changes-requested application and returns the updated summary (200)` |
| Unauthenticated reopen request is rejected | keep | `tests/functional/applications/draft_reopenings.spec.ts:rejects unauthenticated requests to reopen an application (401)` |
| Non-owner applicant is denied reopening | keep | `tests/functional/applications/draft_reopenings.spec.ts:rejects a non-owner applicant from reopening an application (403)` |
| Non-eligible application rejects reopening with a conflict error | keep | `tests/functional/applications/draft_reopenings.spec.ts:rejects reopening a non-eligible application with a conflict error (409)` |
| Missing application returns 404 | keep | `tests/functional/applications/draft_reopenings.spec.ts:returns 404 for a non-existent application` |

## Test list (ordered)

Reads: testing.md

1. `T1` functional - reopens an eligible changes-requested application
2. `T2` functional - rejects unauthenticated reopen requests
3. `T3` functional - rejects a non-owner applicant from reopening
4. `T4` functional - rejects reopening a non-eligible application with a conflict error
5. `T5` functional - returns 404 for a missing application

## Per-test contracts

Reads: testing.md

### T1

- Surface: `app/controllers/application_draft_reopenings_controller.ts#store`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; requested-changes application owned by that applicant via `ApplicationFactory`; existing history row via `ApplicationAuditEntryFactory`.
- Action: `POST` the existing applicant reopen route for the owned requested-changes application.
- Outcome contract: status `200`; unwrapped summary payload contains the application id and `draft` status; the `applications` row returns to draft; a new audit entry records the transition from requested changes to draft.
- Does NOT assert: resubmission history semantics, frontend behavior, or unrelated attachment/category state.
- Why: proves the explicit reopen action returns the same application record to draft for the owner.

### T2

- Surface: `app/controllers/application_draft_reopenings_controller.ts#store`
- Suite: functional
- Setup: no auth; requested-changes application via `ApplicationFactory`.
- Action: `POST` the existing applicant reopen route for the application without logging in.
- Outcome contract: status `401`.
- Does NOT assert: response body shape beyond the rejection status.
- Why: the reopen route stays behind applicant authentication.

### T3

- Surface: `app/controllers/application_draft_reopenings_controller.ts#store`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; requested-changes application owned by a different applicant via `ApplicationFactory`.
- Action: `POST` the existing applicant reopen route for the foreign application.
- Outcome contract: status `403`.
- Does NOT assert: body shape beyond the denial status or any change to the foreign record.
- Why: the reopen action must not expose or reopen another applicant's application.

### T4

- Surface: `app/controllers/application_draft_reopenings_controller.ts#store`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; application in a non-requested-changes state via `ApplicationFactory`.
- Action: `POST` the existing applicant reopen route for that application.
- Outcome contract: status `409`; the application row remains unchanged.
- Does NOT assert: ownership behavior or history content.
- Why: only requested-changes applications may re-enter draft.

### T5

- Surface: `app/controllers/application_draft_reopenings_controller.ts#store`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; no application row with the requested id.
- Action: `POST` the existing applicant reopen route for the missing application id.
- Outcome contract: status `404`.
- Does NOT assert: body shape beyond the not-found status.
- Why: the reopen route should not reveal missing records.

## Runner-model risks

Reads: testing.md

- None identified. Each test uses isolated factories and a single request.
