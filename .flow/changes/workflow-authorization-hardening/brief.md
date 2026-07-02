---
affects: [workflow-authorization, workflow-conflicts]
briefed: 2026-07-02
---

# Workflow Authorization Hardening — Brief

## Entry point, user goal, status

A user reaches workflow actions on an application and wants only the right person to be able to proceed. This is a fix to the existing workflow surface so access rules are enforced consistently.

## Prerequisites

The product must already know who the current user is, whether they are a reviewer, and which application they are trying to affect.

## The journey, step by step

The applicant can only access their own application surfaces.

A reviewer can only perform reviewer actions when the application belongs to them in the review flow.

If a user is not allowed to perform a workflow action, the product rejects the attempt.

If a user is allowed to proceed, the workflow action continues normally.

If two people try to act on the same application in incompatible ways, the product treats the conflict as a real workflow failure rather than quietly accepting the second action.

## Decisions made

| Rejected alternative | Reasoning |
| --- | --- |
| Checking only the reviewer role | Role alone is not enough; the assigned reviewer must also match the current application. |
| Letting applicant and reviewer checks vary by action | The workflow needs one clear access rule per surface so the behavior is predictable. |

## Constraints the journey places on implementation

- Applicant-only areas must remain limited to the owning applicant.
- Reviewer-only actions must remain limited to reviewers.
- Review decisions on an in-review application must remain limited to the assigned reviewer.
- An unsupported workflow attempt must be rejected rather than partially applied.
- A conflicting workflow attempt must be treated as a real conflict, not as a successful update.

