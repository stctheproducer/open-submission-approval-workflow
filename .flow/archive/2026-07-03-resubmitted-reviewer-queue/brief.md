---
affects: [reviewer-queue-start, application-submission]
briefed: 2026-07-03
---

# Resubmitted Reviewer Queue — Brief

## Entry point, user goal, status

A reviewer opens their queue after an applicant has revised and resubmitted an application that previously went through review, was returned for changes, reopened to draft, and submitted again. The reviewer expects that resubmitted application to appear as actionable work so a new review cycle can begin. This is a fix: resubmission is supposed to re-enter the reviewer workflow, but the application can disappear from the queue today.

## Prerequisites

- An application has already completed at least one review cycle that ended in a change request.
- The owning applicant has reopened that application to draft and successfully submitted it again.
- The reviewer is signed in and allowed to access the reviewer queue.

## The journey, step by step

1. A reviewer finishes an earlier cycle by returning an application for changes. The application is no longer in their active in-review work.
2. The owning applicant reopens the returned application, edits it while it is a draft, and submits it again.
3. The applicant sees the application as submitted with a distinct revision-round submission in its history.
4. A reviewer opens the reviewer queue to continue work on newly submitted applications.
5. The resubmitted application appears in the queue as ready work that any eligible reviewer can start review on, alongside other unassigned submitted applications.
6. When the reviewer starts review on that resubmitted application, it becomes owned by that reviewer and moves into in-review work for the new cycle.
7. If the application is not eligible for review start, it does not appear as ready work and the reviewer cannot start review on it from the queue.

## Decisions made

| Rejected alternative | Reasoning |
| --- | --- |
| Resubmitted applications return directly to the previous reviewer as already-owned in-review work | A resubmission starts a new review cycle; the prior reviewer assignment belongs to the earlier cycle and should not block the application from re-entering the shared ready queue. |
| Resubmitted applications stay hidden until manually repaired in the database | Reviewers need to discover resubmitted work through the normal queue without operator intervention. |
| Only the original reviewer may see the resubmitted application | The queue is shared ready work; any eligible reviewer should be able to start the new cycle. |

## Constraints the journey places on implementation

- A successfully resubmitted application must be discoverable in the reviewer queue as ready work, not only in applicant history.
- Resubmitted ready work must follow the same review-start rules as a first-time submission entering the queue.
- Prior reviewer assignment from an earlier cycle must not prevent a resubmitted application from appearing as ready work.
- Applications that are not submitted, or are not eligible for review start, must not appear as ready work in the queue.
- Failed resubmission attempts must not change queue visibility; the application stays out of reviewer ready work until a successful submission occurs.
