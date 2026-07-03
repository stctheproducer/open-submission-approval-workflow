---
affects: [operator-workflow]
briefed: 2026-07-03
---

# operator-workflow - Brief

## Entry point, user goal, status

A maintainer or assessor starts at the repository root and wants one truthful local path for setting up the project, starting local services, and verifying that development works. This is a new documentation and operator-flow slice.

## Prerequisites

Local dependencies are available, the project has been installed, and the developer can start the local database and mail services before running the application.

## The journey, step by step

The user opens the repository guidance and follows the canonical local setup sequence from start to finish.

They install the project dependencies, prepare local configuration, start the local infrastructure, apply the database changes, seed the data, and then start the development environment.

If one of those steps no longer works as written, the user learns that the documented path needs to be corrected rather than assuming the repo is ready.

When the full sequence succeeds, the user has a repeatable way to bring the project up locally and confirm it is in a usable state.

## Decisions made

| Rejected alternative | Reasoning |
| --- | --- |
| Multiple setup paths for different local preferences | One canonical path is easier to verify and easier for an assessor to follow. |
| Aspirational setup text that describes the intended flow instead of the real one | The submission needs an honest operator contract, not a future-state promise. |
| Splitting setup guidance across several disconnected notes | The repo root should give the first and clearest path for local assessment. |

## Constraints the journey places on implementation

The root guidance must describe a single, repeatable local setup and verification flow.

The documented steps must match what the repository actually supports at the time of submission.

Any missing or stale step must be corrected in the repo guidance instead of being hidden behind broad or vague instructions.
