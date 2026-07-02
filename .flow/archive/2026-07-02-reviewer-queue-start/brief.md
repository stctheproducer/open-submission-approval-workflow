---
affects: [reviewer-queue-start]
briefed: 2026-07-02
---

# Reviewer Queue Start — Brief

## Entry point, user goal, status

An authenticated reviewer opens their review workspace and wants to see what needs attention, open a specific application to review its details, and start review in a way that clearly hands the application into owned review.

## Prerequisites

The user must already be signed in as a reviewer. This journey depends on reviewer access being separate from applicant access so the reviewer only sees work that is relevant to review.

## The journey, step by step

The reviewer opens their queue and sees applications that are ready for review, along with applications already assigned to them and still in review.

The reviewer can narrow the queue to the relevant review state so they can focus on either work waiting to be picked up or work they already own.

From the queue, the reviewer opens an application to inspect its details and decide whether to begin review.

When the reviewer starts review, the application moves into owned review and becomes associated with that reviewer.

The reviewer returns to the queue and sees the application reflected as assigned work rather than unclaimed work.

If the reviewer tries to start review on an application that is not eligible for that transition, the system rejects the action and leaves the application unchanged.

## Decisions made

| Alternative | Decision | Reasoning |
| --- | --- | --- |
| Single shared queue vs separating ready work from owned work | Single queue with clear review-state filtering chosen | Reviewers need one place to triage incoming work and continue owned work without switching contexts. |
| Passive detail view vs explicit start-review action | Explicit start-review action chosen | Ownership must be intentional and visible, not inferred from opening an item. |
| Allow multiple reviewers to own the same item vs single ownership | Single reviewer ownership chosen | Review work needs a clear accountable owner once the item leaves the unclaimed queue. |

## Constraints the journey places on implementation

- A reviewer can see a queue of work that is ready for review and work that is already assigned to them.
- A reviewer can filter the queue by review state.
- A reviewer can open an application from the queue to inspect its details.
- A reviewer can start review only when the application is eligible for that transition.
- Starting review moves the application into owned review and makes the reviewer responsible for it.
- Invalid attempts to start review leave the application unchanged.
