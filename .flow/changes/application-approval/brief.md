---
affects: [application-approval]
briefed: 2026-07-02
---

# Application Approval — Brief

## Entry point, user goal, status

An authenticated reviewer opens an application that is already under review and wants to approve it as the final successful outcome of the review cycle. This is a new workflow slice that completes the approval path for a reviewer-assigned application.

## Prerequisites

The reviewer must already be signed in, must be assigned to the application, and the application must still be in the reviewable state.

## The journey, step by step

The reviewer opens an application that is waiting for review and sees that it is ready for a decision.

The reviewer chooses to approve the application.

The system records that approval as the end of the review cycle and shows the application as approved.

The reviewer can return to the application and see that the approval is part of the application's visible history.

The applicant can also see that the application has been approved when they review their own application details.

If the reviewer is not assigned to the application, they cannot approve it.

If the reviewer tries to approve an application that is no longer awaiting review, the system rejects the attempt and leaves the application unchanged.

## Decisions made

| Alternative | Decision | Reasoning |
| --- | --- | --- |
| Treat approval as a private reviewer action vs a visible workflow milestone | Visible workflow milestone chosen | Approval is the defining successful outcome of the review cycle and should be visible to both sides of the application. |
| Allow any reviewer to approve vs require reviewer assignment | Require reviewer assignment chosen | Approval needs clear ownership so the responsible reviewer is accountable for the final decision. |
| Allow approval from any application state vs only while under review | Only while under review chosen | Approval is a terminal review action, not a generic status edit. |

## Constraints the journey places on implementation

- A reviewer can approve only an application they are assigned to.
- An application can be approved only while it is waiting for review.
- A successful approval ends the review cycle and marks the application as approved.
- The approval is visible in the application's history for both reviewer and applicant views.
- Invalid approval attempts leave the application unchanged.
