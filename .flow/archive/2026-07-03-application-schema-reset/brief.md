---
affects: [application-drafts]
briefed: 2026-07-03
---

# Application Schema Reset — Brief

## Entry point, user goal, status

An authenticated applicant enters through the application workspace and wants the draft application journey to match the assessment spec from the start. This is a fix to the application draft experience.

## Prerequisites

The applicant must already be signed in and able to reach their application workspace. The application journey also depends on the fixed category choices and supporting-file handling that the product already exposes elsewhere.

## The journey, step by step

1. The applicant starts a new draft application from their workspace.
2. They enter the application details the spec calls for: a title, a category from the approved list, a description, an amount, and optionally one supporting file.
3. They can return to the draft later and see the same application they were working on.
4. If they decide the supporting file was the wrong one, they can replace it before final submission.
5. If a reviewer has returned the application for changes, the applicant can reopen that same application and continue editing the existing draft instead of starting over.
6. If the applicant leaves required details empty, chooses a category outside the approved list, or tries to attach more than one supporting file, the application cannot move forward until the problem is corrected.

## Decisions made

| Rejected alternative | Reasoning |
| --- | --- |
| Use a date instead of an amount | The spec example is centered on an amount-based application, so amount is the clearer product fit. |
| Allow multiple supporting files | The spec only asks for one optional file, and keeping it to one avoids making the draft journey heavier than needed. |
| Keep the first supporting file fixed once uploaded | Replacing the file is a better draft experience because applicants can correct mistakes without starting over. |

## Constraints the journey places on implementation

- The application must support a required title, a category chosen from the approved list, a description, an amount, and one optional supporting file.
- A draft application must remain editable until it is submitted.
- When a draft already has a supporting file, replacing it must swap the old file out rather than accumulate another one.
- When a reviewer returns an application for changes, reopening it must preserve the same application record so the applicant can continue from where they left off.
- The application journey must not expose a second, competing draft shape for older records; fresh and reopened drafts should follow the same product rules.
