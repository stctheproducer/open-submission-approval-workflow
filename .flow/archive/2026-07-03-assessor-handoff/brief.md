---
affects: [assessor-handoff]
briefed: 2026-07-03
---

# assessor-handoff - Brief

## Entry point, user goal, status

An assessor opens the root README and wants a finished handoff that explains the implemented system, how to verify it, and how to judge the submission. This is an extension of the submission documentation.

## Prerequisites

The local operator path is already truthful, and the submission has enough finished behavior that the README can describe it as a handoff instead of a plan.

## The journey, step by step

The user reads the root README from top to bottom and can immediately tell what the submission is and what problem it solves.

They can find the setup path, the workflow summary, the testing notes, the deployment shape, and the main trade-offs without reconstructing missing context from the codebase.

The document tells the reader what has actually been built and verified, not what was only intended earlier in the project.

If a hosted detail is still unresolved, the reader sees that plainly instead of being led to believe the submission is already finished in that area.

## Decisions made

| Rejected alternative | Reasoning |
| --- | --- |
| A short README that only sketches the product at a high level | The assessment needs a handoff the reader can use, not a teaser. |
| A narrative that mixes finished behavior with future ideas | That blurs what is actually being submitted. |
| A minimal deployment note with no explanation of the overall shape | The assessor needs enough context to evaluate the system confidently. |

## Constraints the journey places on implementation

The root README must present the submission as a finished, assessor-ready handoff.

The README must keep the rubric-friendly section structure that helps a reviewer find setup, workflow, testing, deployment, and trade-offs quickly.

The text must describe verified reality rather than provisional intent.
