---
affects: [reviewer-application-detail]
briefed: 2026-07-03
---

# Reviewer Application Detail — Brief

## Entry point, user goal, status

A reviewer opens a queued application and wants enough context to decide what to do with it. This is a new reviewer detail slice that adds the application review view and its history.

## Prerequisites

The reviewer has already signed in, reached the reviewer area, and selected an application from their queue.

## The journey, step by step

1. The reviewer selects an application from the queue.
2. The product shows the application’s current details and its current workflow state.
3. The product also shows the status-change history so the reviewer can understand how the application reached its current state.
4. The reviewer uses that context to decide whether to approve, return, or continue working on the application.
5. If the reviewer cannot access that application, the product keeps them out of the detail view.

## Decisions made

| Alternative | Decision | Reason |
| --- | --- | --- |
| Separate detail and history experiences vs one combined review view | One combined review view chosen | Reviewers need the current record and its status history together to make a decision quickly. |
| Read-only summary vs decision-ready detail view | Decision-ready detail view chosen | The review surface should support the next action without making the reviewer jump elsewhere for context. |
| Minimal metadata vs full current state visibility | Full current state visibility chosen | The reviewer needs to know exactly where the application is in the workflow before acting. |

## Constraints the journey places on implementation

- The reviewer can open a selected application from the queue.
- The review view shows the application’s current details, current workflow state, and status-change history.
- The history is visible as part of the review experience, not hidden away from the decision surface.
- If the reviewer cannot access the application, the product does not show that review view.
