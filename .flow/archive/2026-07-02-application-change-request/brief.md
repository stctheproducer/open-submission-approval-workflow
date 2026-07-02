---
affects: [application-change-request]
briefed: 2026-07-02
---

# Application Change Request — Brief

## Entry point, user goal, status

An assigned reviewer is looking at an application that is currently under review and wants to send it back for changes with a required comment. This is a new workflow slice for the non-terminal review path.

## Prerequisites

The application must already be in the reviewer workflow, and the reviewer must be the person currently responsible for it.

## The journey, step by step

The reviewer opens an application that is currently under review.

The reviewer chooses to return it for changes and provides a comment explaining what needs to change.

The system accepts the change request and the application moves into a changes-requested state that is visible to the applicant.

The applicant later opens the same application and sees that it has been returned for changes rather than approved or rejected.

If the reviewer tries to request changes without a comment, the system rejects the attempt and the application stays under review.

If the reviewer tries to request changes on an application that is no longer eligible for that transition, the system rejects the attempt and the application remains unchanged.

## Decisions made

| Alternative | Decision | Reasoning |
| --- | --- | --- |
| Reviewer returns for changes vs approves or rejects | Return for changes chosen | The loop needs a non-terminal path that sends the applicant back into editing instead of ending the review. |
| Comment required vs optional for a change request | Comment required chosen | The applicant needs a concrete explanation of what must change before resubmitting. |
| Show the returned state to the applicant vs hide reviewer decisions | Show the returned state chosen | The applicant needs to know that the next step is revision, not a final decision. |

## Constraints the journey places on implementation

- A reviewer can return an application for changes only while it is under review.
- A change request must include a meaningful comment that explains what needs to change.
- A successful change request moves the application into a changes-requested state.
- The applicant can see the returned state on the same application record.
- Invalid change-request attempts leave the application unchanged.
