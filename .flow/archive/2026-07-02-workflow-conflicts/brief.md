---
affects: [workflow-conflicts]
briefed: 2026-07-02
---

# Workflow Conflicts — Brief

## Entry point, user goal, status

An authenticated user is moving through the application workflow and hits a case where the action they chose is no longer allowed. The goal is to make those failures predictable and consistent so the workflow contract is clear when the application has already moved on.

## Prerequisites

The earlier workflow slices must already exist so there is a completed application lifecycle to protect. This change builds on the established application workflow rather than introducing a new workflow stage.

## The journey, step by step

The user attempts a workflow action on an application that is no longer eligible for that action.

The system rejects the attempt with a clear conflict response that tells the client the workflow state no longer matches the requested action.

Validation, authorization, not-found, and workflow-conflict failures all follow the same overall response contract so the client can handle them reliably.

The same error behavior appears across the main workflow actions so the application does not behave differently from one route to another.

If the user retries the same invalid action without the underlying application state changing, the system continues to reject it in the same way.

## Decisions made

| Alternative | Decision | Reasoning |
| --- | --- | --- |
| Treat workflow conflicts as a one-off response vs a shared contract across workflow routes | Shared contract chosen | The issue asks for a consistent backend contract, not isolated fixes, so clients can rely on one error shape everywhere. |
| Frame this as a new user-facing feature vs a hardening change | Hardening change chosen | The value is in making illegal transitions explicit and verifiable, not adding a new workflow outcome. |
| Limit the behavior to one transition vs cover the main workflow actions | Cover the main workflow actions chosen | The acceptance criteria call for proof across the main transitions already introduced, so the behavior needs to hold across the workflow surface. |

## Constraints the journey places on implementation

- Illegal workflow actions must be rejected consistently once the application has moved to an incompatible state.
- Workflow-conflict failures must be machine-readable and distinct from validation, authorization, and not-found failures.
- The same error contract must hold across the implemented workflow routes.
- Tests must demonstrate the shared error behavior across the existing workflow transitions.

