---
affects: [application-approval]
briefed: 2026-07-03
---

# Application Approval — Brief

## Entry point, user goal, status

A reviewer is looking at an eligible application and wants to approve it as the decision for that review. This is a new reviewer decision slice that completes the approval path.

## Prerequisites

The reviewer has already signed in, opened an application in the reviewer area, and the application is eligible for approval.

## The journey, step by step

1. The reviewer opens an eligible application.
2. The product makes the approval choice available only when the application can actually be approved.
3. The reviewer approves the application.
4. The approval completes the review and moves the application out of the active review state.
5. If the application is no longer eligible or belongs to another reviewer, the product rejects the attempt and leaves the application unchanged.

## Decisions made

| Alternative | Decision | Reason |
| --- | --- | --- |
| Approval as a direct review decision vs a separate administrative action | Direct review decision chosen | Approval should happen where the reviewer is already evaluating the application. |
| Available only when eligible vs always visible | Available only when eligible chosen | The reviewer should not be invited to take an action that cannot succeed. |
| Single approval outcome vs approval plus extra routing step | Single approval outcome chosen | The user goal is to finish the review, not to trigger another workflow. |

## Constraints the journey places on implementation

- The approval choice is only available when the application is eligible for approval.
- Only the reviewer who can act on the application can approve it.
- A successful approval completes the review and changes the application’s visible state accordingly.
- Invalid approval attempts are rejected and do not change the application.
