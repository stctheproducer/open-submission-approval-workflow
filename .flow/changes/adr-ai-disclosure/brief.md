---
affects: [adr-ai-disclosure]
briefed: 2026-07-03
---

# adr-ai-disclosure - Brief

## Entry point, user goal, status

An assessor compares the README, ADRs, and AI usage disclosure and wants the documentation to tell one consistent final story. This is a documentation alignment slice for the finished submission.

## Prerequisites

The README handoff already reads as final, and the architectural decisions are stable enough to be expressed consistently across the submission docs.

## The journey, step by step

The user reads the ADRs and the root README and sees the same architectural story in each place.

The user can tell which architectural decisions are intentional, which ones were chosen for the submission, and which trade-offs were made to support the assessment.

The AI usage disclosure names the AI tools that were used, explains what each was used for, and makes clear what was checked by hand.

If the documentation still sounds provisional, the user can see that the submission is not yet finished and does not get a false sense of completeness.

## Decisions made

| Rejected alternative | Reasoning |
| --- | --- |
| Keeping the AI disclosure vague | The submission should be auditable, not just suggestive. |
| Letting the ADRs and README drift into slightly different stories | A reviewer should not have to reconcile contradictions across the docs. |
| Treating the AI disclosure as a draft note | The final handoff needs a complete, final-tense account. |

## Constraints the journey places on implementation

The ADRs, README, and AI disclosure must describe one consistent final submission story.

The AI disclosure must be specific enough that a reviewer can see which tools were used and what was manually verified.

Any stale or provisional wording must be removed before the submission is handed over.
