# API Error Responses — Test Plan

> Stack: AdonisJS API
> Source: /Users/stctheproducer/Developer/personal-projects/open-submission-approval-workflow/.flow/changes/api-error-responses/blueprint.md
> Date: 2026-07-03

## Summary

This plan updates the backend API error contract so thrown exceptions return one RFC 9457 problem-details shape. The functional coverage stays on the existing application request suites and changes their failure assertions to pin the new top-level error envelope across validation, auth, not-found, conflict, and transition-rejection paths.

## Pre-implementation requirements

- None.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| ------------------- | -------- | ----- |
| POST /api/v1/applicant/applications unauthenticated → 401 problem-details response | change | apps/backend/tests/functional/applications/store.spec.ts:rejects unauthenticated requests to create an application (401) |
| POST /api/v1/applicant/applications invalid payload → 422 problem-details response with field detail | change | apps/backend/tests/functional/applications/store.spec.ts:rejects an invalid store payload with field-level errors (422) |
| GET /api/v1/applicant/applications/:id unauthenticated → 401 problem-details response | change | apps/backend/tests/functional/applications/show.spec.ts:rejects unauthenticated requests to view an application (401) |
| GET /api/v1/applicant/applications/:id foreign or missing → 404 problem-details response | change | apps/backend/tests/functional/applications/show.spec.ts:returns 404 for a foreign or non-existent application |
| PATCH /api/v1/applicant/applications/:id unauthenticated → 401 problem-details response | change | apps/backend/tests/functional/applications/update.spec.ts:rejects unauthenticated requests to update an application (401) |
| PATCH /api/v1/applicant/applications/:id invalid payload → 422 problem-details response with field detail | change | apps/backend/tests/functional/applications/update.spec.ts:rejects an invalid update payload with field-level errors (422) |
| PATCH /api/v1/applicant/applications/:id foreign or missing → 404 problem-details response | change | apps/backend/tests/functional/applications/update.spec.ts:returns 404 when updating a foreign or non-existent application — "{label}" |
| POST /api/v1/applicant/applications/:id/submissions unauthenticated → 401 problem-details response | change | apps/backend/tests/functional/applications/submissions.spec.ts:rejects unauthenticated requests to submit an application (401) |
| POST /api/v1/applicant/applications/:id/submissions foreign or missing → 404 problem-details response | change | apps/backend/tests/functional/applications/submissions.spec.ts:returns 404 when submitting a foreign or non-existent application |
| POST /api/v1/applicant/applications/:id/reopen unauthenticated → 401 problem-details response | change | apps/backend/tests/functional/applications/draft_reopenings.spec.ts:rejects unauthenticated requests to reopen an application (401) |
| POST /api/v1/applicant/applications/:id/reopen non-owner → 403 problem-details response | change | apps/backend/tests/functional/applications/draft_reopenings.spec.ts:rejects a non-owner applicant from reopening an application (403) |
| POST /api/v1/applicant/applications/:id/reopen foreign or missing → 404 problem-details response | change | apps/backend/tests/functional/applications/draft_reopenings.spec.ts:returns 404 for a non-existent application |
| GET /api/v1/applicant/applications index unauthenticated → 401 problem-details response | change | apps/backend/tests/functional/applications/index.spec.ts:rejects unauthenticated requests to the applications index (401) |
| GET /api/v1/applicant/applications/reviewer queue unauthenticated → 401 problem-details response | change | apps/backend/tests/functional/applications/reviewer.spec.ts:rejects unauthenticated requests to the reviewer queue (401) |
| GET /api/v1/applicant/applications/reviewer queue non-reviewer → 403 problem-details response | change | apps/backend/tests/functional/applications/reviewer.spec.ts:rejects non-reviewer users from the reviewer queue (403) |
| GET /api/v1/applicant/applications/reviewer queue inaccessible application → 404 problem-details response | change | apps/backend/tests/functional/applications/reviewer.spec.ts:returns 404 for an inaccessible application (404) |
| POST /api/v1/reviewer/applications/:id/review-starts unauthenticated → 401 problem-details response | change | apps/backend/tests/functional/applications/reviewer.spec.ts:rejects non-reviewer users from starting review (403) plus the nearby 404 path |
| POST /api/v1/reviewer/applications/:id/approvals unauthenticated → 401 problem-details response | change | apps/backend/tests/functional/applications/approvals.spec.ts:rejects unauthenticated requests to approve an application (401) |
| POST /api/v1/reviewer/applications/:id/approvals non-reviewer or unassigned reviewer → 403 problem-details response | change | apps/backend/tests/functional/applications/approvals.spec.ts:rejects non-reviewer users from approving an application (403); rejects an unassigned reviewer from approving an application (403) |
| POST /api/v1/reviewer/applications/:id/rejections unauthenticated → 401 problem-details response | change | apps/backend/tests/functional/applications/rejections.spec.ts:rejects unauthenticated requests to reject an application (401) |
| POST /api/v1/reviewer/applications/:id/rejections non-reviewer or unassigned reviewer → 403 problem-details response | change | apps/backend/tests/functional/applications/rejections.spec.ts:rejects non-reviewer users from rejecting an application (403); rejects an unassigned reviewer from rejecting an application (403) |
| POST /api/v1/reviewer/applications/:id/rejections invalid comment → 422 problem-details response with field detail | change | apps/backend/tests/functional/applications/rejections.spec.ts:rejects a missing or blank comment with field-level validation errors (422) |
| POST /api/v1/reviewer/applications/:id/change-request unauthenticated → 401 problem-details response | change | apps/backend/tests/functional/applications/change_requests.spec.ts:rejects unauthenticated requests to request changes (401) |
| POST /api/v1/reviewer/applications/:id/change-request non-reviewer or unassigned reviewer → 403 problem-details response | change | apps/backend/tests/functional/applications/change_requests.spec.ts:rejects non-reviewer users from requesting changes (403); rejects an unassigned reviewer from requesting changes (403) |
| POST /api/v1/reviewer/applications/:id/change-request invalid comment → 422 problem-details response with field detail | change | apps/backend/tests/functional/applications/change_requests.spec.ts:rejects invalid comment payloads with field-level validation errors (422) |
| POST /api/v1/reviewer/applications/:id/change-request non-eligible application → 409 problem-details response | change | apps/backend/tests/functional/applications/change_requests.spec.ts:rejects a change request on a non-eligible application with a conflict error (409) |
| POST /api/v1/applicant/applications/:id/submissions stale transition → 409 problem-details response | change | apps/backend/tests/functional/applications/workflow_conflicts.spec.ts:rejects stale workflow transitions with a consistent 409 conflict response across all main routes |
| Shared failure contract across validation, auth, not-found, and conflict responses | change | apps/backend/tests/functional/applications/workflow_conflicts.spec.ts:conflict response envelope matches the same shape used by validation, authorization, and not-found failures |
| Unexpected thrown API errors still fall through to the framework handler | keep | No direct test in the current application suite; covered indirectly by the handler fallback path |

## Test list (ordered)

Reads: testing.md

### Surface: application API failure responses

T1 [functional] - returns RFC 9457 problem-details for unauthenticated and authorization failures across application endpoints

Outcome: status is 401 or 403 per case; response body includes RFC 9457 top-level fields and no legacy `errors` envelope.

T2 [functional] - returns RFC 9457 problem-details for validation failures across application endpoints

Outcome: status is 422; response body includes RFC 9457 top-level fields plus field-level detail carried through the problem-details extensions.

T3 [functional] - returns RFC 9457 problem-details for not-found and conflict failures across application endpoints

Outcome: status is 404 or 409 per case; response body includes RFC 9457 top-level fields and no legacy `errors` envelope.

T4 [functional] - preserves successful application responses unchanged

Outcome: existing 200/201 success assertions remain valid; response wrapping stays as-is for data responses.

## Runner-model risks

Reads: testing.md

- Existing tests mix application-level happy paths and failure-path assertions in the same files. The plan keeps that shape and truncates the database per group, so the main risk is only accidentally asserting the old envelope in a changed test.
- The conflict and validation rows loop through several inputs. Those should stay table-driven only if the final plan still asserts one observable behavior per test row; otherwise split them before implementation.

