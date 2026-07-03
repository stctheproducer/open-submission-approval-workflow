# Application Resubmission History — Test Plan

> Stack: AdonisJS API
> Source: `.flow/changes/application-resubmission-history/blueprint.md`
> Date: 2026-07-03

## Summary

This plan covers resubmission of a reopened application and locks the visible history contract for the second submission. It also preserves the existing failure paths that prevent duplicate history from being added on rejected submissions.

## Pre-implementation requirements

None.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| ------------------- | -------- | ----- |
| Initial draft submission still succeeds and writes the first history entry | keep | `tests/functional/applications/submissions.spec.ts:submits an owned draft application and returns the submitted detail with the first history entry (200)` |
| Unauthenticated submission request is rejected | keep | `tests/functional/applications/submissions.spec.ts:rejects unauthenticated requests to submit an application (401)` |
| Foreign or missing application remains not found | keep | `tests/functional/applications/submissions.spec.ts:returns 404 when submitting a foreign or non-existent application` |
| Non-draft submission conflict behavior remains unchanged | keep | `tests/functional/applications/submissions.spec.ts:rejects submission of a non-draft application with a conflict error (409)` |
| Reopened draft resubmission creates a distinct revision-round history event | add | — |
| Failed reopened draft submission does not add a new revision-round event | add | — |

## Test list (ordered)

Reads: testing.md

1. `T1` functional - submits a reopened draft application and shows the revision-round history entry
2. `T2` functional - rejects a reopened draft submission that fails and keeps history unchanged
3. `T3` functional - keeps the existing submission, auth, not-found, and conflict coverage intact

## Per-test contracts

Reads: testing.md

### T1

- Surface: `app/controllers/application_submissions_controller.ts#store`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; requested-changes application owned by that applicant reopened back to draft; existing history row from the earlier submission and change-request flow.
- Action: `POST` the existing applicant submission route for the reopened draft application.
- Outcome contract: status `200`; wrapped detailed application response; `status` becomes `submitted`; `history` contains the earlier submission plus a distinct new revision-round submission event for the reopened record; the new audit log entry exists for the second submission.
- Does NOT assert: reopening behavior, frontend rendering, or unrelated attachment/category state.
- Why: proves the second submission is visible as its own history event on the same application record.

### T2

- Surface: `app/controllers/application_submissions_controller.ts#store`
- Suite: functional
- Setup: authenticated applicant via `UserFactory`; reopened draft application that will fail submission because of a non-draft conflict or equivalent guard state.
- Action: `POST` the existing applicant submission route for the reopened draft application in the failing state.
- Outcome contract: status `409`; the application remains in draft or its prior state as appropriate; no new submission history row or audit log row is added.
- Does NOT assert: success-path history shape or reopening behavior.
- Why: failed resubmissions must not fabricate a new revision-round history event.

### T3

- Surface: `app/controllers/application_submissions_controller.ts#store`
- Suite: functional
- Setup: keep the existing unauthenticated, foreign/missing, and non-draft conflict cases exactly as already covered.
- Action: existing submission requests from the current test file.
- Outcome contract: existing `401`, `404`, and `409` coverage remains unchanged.
- Does NOT assert: any new resubmission-specific behavior.
- Why: preserves the current submission guardrails while the resubmission contract is added.

## Runner-model risks

Reads: testing.md

- None identified. The plan stays within the existing truncate-per-test pattern and uses isolated factories per case.
