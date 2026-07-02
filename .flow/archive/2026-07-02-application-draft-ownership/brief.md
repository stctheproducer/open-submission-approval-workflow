---
affects: [application-draft-ownership]
briefed: 2026-07-02
---

# Application Draft Ownership — Brief

## Entry point, user goal, status

An authenticated applicant starts from their own application workspace and wants to create a new application, return to it later, and keep editing it only while it remains a draft. This is a new workflow slice that establishes the applicant-owned baseline for the larger approval process.

## Prerequisites

The user must already be signed in as an applicant. This journey depends on the broader application workflow existing as a personal workspace where each applicant sees only their own records.

## The journey, step by step

The applicant starts from their personal application area and chooses to create a new application.

The system creates a draft application for that applicant and shows the newly created application as editable.

The applicant returns later and sees a list of their own applications, including the new draft.

From that list, the applicant opens the draft to review its current contents and continue working on it.

The applicant updates the draft and saves their changes.

If the applicant tries to access another applicant's application, they cannot see or change it.

If the applicant tries to edit an application that is no longer a draft, the system rejects the change and leaves the application unchanged.

## Decisions made

| Alternative | Decision | Reasoning |
| --- | --- | --- |
| Shared applicant and reviewer workspace vs applicant-only workspace | Applicant-only workspace chosen | Ownership needs to be obvious from the start, and this slice is about the applicant's personal record lifecycle. |
| Create a blank application first vs require all details up front | Blank draft first chosen | The journey needs a stable starting record that the applicant can come back to and finish later. |
| Allow editing after draft vs lock once the application leaves draft | Lock once it leaves draft chosen | Draft is the only state meant for applicant-side editing in this slice; later workflow states belong to review. |

## Constraints the journey places on implementation

- An applicant can create a new application record as a draft.
- An applicant can see only their own applications.
- An applicant can open one of their own applications and continue editing it while it is still a draft.
- An applicant cannot view or change another applicant's application.
- Once an application is no longer a draft, applicant-side edits are not allowed.
- The system must preserve the draft as the editable baseline for later workflow steps.
