# Resubmitted Reviewer Queue — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/resubmitted-reviewer-queue/blueprint.md
> Date: 2026-07-03
> built: 2026-07-03

## Summary

Add one functional test proving a resubmitted application appears in the reviewer ready queue and can start a new review cycle. Extend change-request test to assert assignee is cleared when a cycle ends.

## Pre-implementation requirements

_None._

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| --- | --- | --- |
| Unauthenticated reviewer queue → 401 | keep | functional/applications/reviewer.spec.ts:rejects unauthenticated requests to the reviewer queue (401) |
| Non-reviewer queue → 403 | keep | functional/applications/reviewer.spec.ts:rejects non-reviewer users from the reviewer queue (403) |
| Combined queue lists ready + owned | keep | functional/applications/reviewer.spec.ts:lists the combined reviewer queue paginated with most-recent-first ordering (200) |
| Review start on eligible submitted app | keep | functional/applications/reviewer.spec.ts:starts review on an eligible submitted application and returns the updated detail (200) |
| Change request clears reviewer assignment | change | functional/applications/change_requests.spec.ts:requests changes on an owned under-review application and returns the updated detail (200) |
| Resubmitted app visible in reviewer ready queue | add | — |
| Resubmitted app can start review again | add | — |

## Test list (ordered)

Reads: testing.md

1. T1 [functional] — requests changes on an owned under-review application and clears reviewer assignment (200)
2. T2 [functional] — lists a resubmitted application in the reviewer ready queue after change request, reopen, and resubmit (200)
3. T3 [functional] — starts review on a resubmitted application from the ready queue (200)

## Per-test contracts

Reads: testing.md

### Test 1 — requests changes on an owned under-review application and clears reviewer assignment (200)

- **Surface:** reviewer.application_change_requests.store
- **Suite:** functional
- **Setup:**
  - Factories: reviewer (role reviewer), applicant, application (`under_review`, `assignedReviewerId` = reviewer)
  - Fakes: none
  - Auth: reviewer session
- **Action:** POST change request with valid comment via `reviewer.application_change_requests.store`
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: { status: changes_requested } }` wrapped per transformer
  - DB: `applications` row has `status = changes_requested` and `assigned_reviewer_id` is null
- **Does NOT assert:** queue listing, resubmission
- **Why:** Blueprint — `requestChange` clears assignee when the review cycle ends.

### Test 2 — lists a resubmitted application in the reviewer ready queue after change request, reopen, and resubmit (200)

- **Surface:** reviewer.applications.index
- **Suite:** functional
- **Setup:**
  - Factories: reviewer, applicant, application through full cycle (submit → start review → request changes → reopen → resubmit) via HTTP
  - Fakes: none
  - Auth: reviewer session for queue request
- **Action:** GET `reviewer.applications.index` with `reviewState=ready`
- **Outcome contract:**
  - Status: 200
  - Body: paginated `{ data: [...] }` includes the application id with `status = submitted` and no `assignedReviewer` (or null assignee)
- **Does NOT assert:** review start, applicant history detail
- **Why:** Brief journey step 5 — resubmitted work is discoverable as ready queue items.

### Test 3 — starts review on a resubmitted application from the ready queue (200)

- **Surface:** reviewer.application_review_starts.store
- **Suite:** functional
- **Setup:**
  - Same end-to-end resubmission setup as T2 through resubmit
  - Auth: reviewer session
- **Action:** POST `reviewer.application_review_starts.store` for the resubmitted application
- **Outcome contract:**
  - Status: 200
  - Body: `{ data: { status: under_review, assignedReviewer: { id: reviewer.id } } }` per reviewer detail transformer
  - DB: `applications` row `status = under_review`, `assigned_reviewer_id = reviewer.id`
- **Does NOT assert:** full history length, applicant-facing endpoints
- **Why:** Brief journey step 6 — new review cycle can begin from the queue.

## Factories audit

Reads: testing.md

| Factory | Existing / New | Tests |
| --- | --- | --- |
| UserFactory | existing | T1–T3 |
| ApplicationFactory | existing | T1–T3 |

## Fakes audit

Reads: testing.md

_None._

## Order rationale

T1 extends an existing change-request test before adding the new resubmission queue flow (T2 then T3).

## Runner-model risks

Reads: testing.md

None identified — tests use per-group DB truncate and independent HTTP setup.

## Open questions

_None._

---
