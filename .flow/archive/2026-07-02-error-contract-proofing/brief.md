---
affects: [workflow-conflicts, workflow-authorization]
briefed: 2026-07-02
---

# Error Contract Proofing — Brief

## Entry point, user goal, status

A user hits a blocked workflow or access failure and wants the product to respond in one consistent way. This is a fix that proves the workflow API uses one shared error contract for the important failure cases.

## Prerequisites

The underlying workflow and access rules must already be in place so their failures can be exercised.

## The journey, step by step

When a user attempts an invalid workflow action, the product returns a conflict failure.

When a user attempts an action they are not allowed to perform, the product returns a forbidden failure.

When a requested application cannot be found, the product returns a not-found failure.

When the user sends invalid input, the product returns a validation failure.

The user sees one consistent error shape across these failure cases instead of a different format for each one.

## Decisions made

| Rejected alternative | Reasoning |
| --- | --- |
| Different error shapes per failure type | The frontend needs one coherent contract instead of route-specific special cases. |
| Only standardizing conflict failures | The shared contract needs to cover the main failure categories together to be useful. |

## Constraints the journey places on implementation

- Validation failures must use the shared error contract.
- Forbidden failures must use the shared error contract.
- Not-found failures must use the shared error contract.
- Conflict failures must use the shared error contract.
- The shared error contract must be the normal form for the workflow and access failure cases that the user can encounter.

