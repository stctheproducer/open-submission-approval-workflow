---
affects: [application-submission-history]
briefed: 2026-07-02
---

# Application Submission History — Brief

## Entry point, user goal, status

An authenticated applicant is looking at one of their own draft applications and wants to submit it so it can enter the reviewer workflow. After submission, the applicant also wants to see proof of that action on the application detail page so the first step in the application's review history is visible.

This is a new workflow slice that moves an application out of draft and makes the start of its approval trail visible to the applicant.

## Prerequisites

The user must already be signed in as an applicant and must be acting on their own draft application. The application must still be in a state that can be submitted.

## The journey, step by step

The applicant opens one of their draft applications and chooses to submit it.

The system accepts the submission and the application leaves draft state and becomes part of the reviewer workflow.

The applicant returns to the application detail view and sees that the submission is recorded in the application's visible history.

If the applicant tries to submit an application they do not own, the system does not allow it.

If the applicant tries to submit an application that is no longer draft, the system rejects the attempt and leaves the application unchanged.

If the applicant views the application after submission, the detail page reflects the submitted state and shows the first workflow history entry.

## Decisions made

| Alternative | Decision | Reasoning |
| --- | --- | --- |
| Treat submission as just a state change vs state change plus visible history | State change plus visible history chosen | The submission matters because it moves the application into the reviewer process, and that action should be visible to the applicant immediately. |
| Make history visible only to reviewers vs visible on the application detail page | Visible on the application detail page chosen | The applicant needs confirmation that the application was submitted and a trace of what happened to it next. |
| Allow submission from any state vs only from draft | Only from draft chosen | Submission should be a one-way step out of the editable phase, not a generic status shortcut. |

## Constraints the journey places on implementation

- An applicant can submit only their own application.
- An applicant can submit only when the application is still in draft.
- A successful submission moves the application into the reviewer workflow.
- The application detail view shows the submission in the application's history.
- Invalid submission attempts leave the application unchanged.
