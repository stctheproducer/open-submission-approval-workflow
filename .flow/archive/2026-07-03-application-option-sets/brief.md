---
affects: [application-option-sets]
briefed: 2026-07-03
---

# Application Option Sets — Brief

## Entry point, user goal, status

An authenticated applicant enters the application draft journey and wants the available category choices to come from one shared product-owned source instead of being invented separately in the applicant experience. This is a new supporting journey for application drafting.

## Prerequisites

- Applicant-owned draft creation and editing.

## The journey, step by step

1. The applicant opens the application draft experience and is offered the available category choices from the product's shared source of truth.
2. The applicant chooses from the currently allowed category options when creating or editing an application draft.
3. When the available category options change in the product, the applicant draft experience reflects the current allowed choices instead of stale local copies.
4. When category options cannot be provided, the draft journey cannot pretend that unverified category choices are still valid.

## Decisions made

| Decision | Options considered | Chosen | Why |
| --- | --- | --- | --- |
| Option-set scope | Category only vs multiple option sets in the same slice | Category only | Keeps the slice narrow and aligned with the current issue scope. |
| Source of truth | Product-owned shared option set vs applicant-local option definitions | Product-owned shared option set | Allowed categories must stay consistent across the product. |

## Constraints the journey places on implementation

- The product must define one backend-owned category option set for applicant draft flows.
- The applicant draft journey must use the current allowed category choices instead of a separate local copy.
- The journey must not silently accept unsupported category values that are outside the shared option set.
