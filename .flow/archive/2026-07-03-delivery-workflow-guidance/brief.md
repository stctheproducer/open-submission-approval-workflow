---
affects: [delivery-workflow-guidance]
briefed: 2026-07-03
---

# delivery-workflow-guidance - Brief

## Entry point, user goal, status

A contributor or assessor reads the repository guidance and wants to understand how work moves from issue to review to merge in this assessment repo. This is a documentation and process-visibility slice.

## Prerequisites

The repo already has a clear issue tracker and pull request convention, and the guidance can refer to that finished process instead of inventing one.

## The journey, step by step

The user opens the repo guidance and can follow the delivery process from issue creation through review and merge.

They can see that work is organized as explicit issues, then delivered in reviewable PRs, then checked before merge.

The guidance makes it clear that the repository values a legible delivery history instead of an opaque implementation drop.

If the repo rules and the workflow guidance disagree, the user sees a contradiction that needs correction rather than a polished but misleading explanation.

## Decisions made

| Rejected alternative | Reasoning |
| --- | --- |
| Leaving delivery organization implicit | An assessor should be able to inspect the repo and understand how the work was delivered. |
| Encouraging direct code drops instead of reviewable slices | That would make the submission harder to reason about and harder to review. |
| Describing a generic process that does not match the repo’s own rules | The guidance needs to match the actual delivery practice. |

## Constraints the journey places on implementation

The repository guidance must make the issue -> PR -> review -> merge path explicit.

The guidance must stay aligned with the repository’s commit and pull request rules.

The final delivery history must remain legible to someone reviewing the submission.
