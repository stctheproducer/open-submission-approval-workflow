# Reviewer Queue Status Filtering — Test Plan

> Stack: AdonisJS API
> Source: .flow/changes/reviewer-queue-status-filtering/blueprint.md
> Date: 2026-07-03

## Summary

This plan covers the reviewer queue status filter and the pagination behavior that goes with it. It locks the filtered queue shape and the preserved query string on the next-page link.

## Pre-implementation requirements

_None._

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| Observable behavior | Decision | Notes |
| ------------------- | -------- | ----- |
| The selected reviewer queue status narrows the queue response | keep | tests/functional/applications/reviewer.spec.ts:keeps the selected review-state filter on reviewer queue pagination links (200) |

## Test list (ordered)

Reads: testing.md

1. `T1 [functional]` - keeps the selected review-state filter on reviewer queue pagination links (200)

## Per-test contracts

Reads: testing.md

### Test 1 — keeps the selected review-state filter on reviewer queue pagination links (200)

- **Surface:** `ReviewerApplicationsController.index`
- **Suite:** functional
- **Setup:**
  - Factories: `UserFactory`, `ApplicationFactory`
  - Fakes: none
  - Auth: signed-in reviewer
  - Other: seed submitted and owned-under-review applications; request the queue with `reviewState=owned` and `perPage=1`
- **Action:** `GET reviewer.applications.index?reviewState=owned&perPage=1`
- **Outcome contract:**
  - Status: 200
  - Body: paginated queue payload with a single under-review item owned by the current reviewer
  - DB / fake / exception assertions: the page contains `status = under_review` and `assignedReviewer.id = reviewer.id`; `metadata.nextPageUrl` includes `reviewState=owned`
- **Does NOT assert:** review-start behavior, detail payload shape, or any row mutation
- **Why:** the reviewer queue must preserve the selected status filter while paging through the same queue

## Factories audit

Reads: testing.md

| Test | Factory | Existing / New |
| ---- | ------- | -------------- |
| T1 | UserFactory, ApplicationFactory | Existing |

## Fakes audit

Reads: testing.md

| Test | Fake / swap | Binding + file |
| ---- | ----------- | -------------- |
| T1 | none | n/a |

## Order rationale

There is only one test, so no ordering tradeoff exists.

## Runner-model risks

Reads: testing.md

None identified.

## Open questions

None.
