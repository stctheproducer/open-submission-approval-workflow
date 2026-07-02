---
affects: [application-rejection-comment]
briefed: 2026-07-02
---

# Application Rejection with Required Comment — Brief

## Entry point, user goal, status

An authenticated reviewer opens an application that is already under review and wants to reject it in a way that clearly records why the decision was made. The reviewer needs the rejection to be treated as a complete workflow decision, and the applicant needs to be able to see that outcome later in the application's visible history.

This is a reviewer decision slice for the terminal rejection path. It adds a required explanation to the rejection decision and makes the result visible on both sides.

## Prerequisites

The user must already be signed in as a reviewer. The application must already be in the review stage where a reviewer can make a final decision.

## The journey, step by step

The reviewer opens an application that is currently under review and chooses to reject it.

The system only allows the rejection when the reviewer provides a meaningful comment with the decision.

When the rejection succeeds, the application moves into its rejected outcome and the decision is recorded in its audit history.

The reviewer can later return to the application and see the rejection reflected in the visible history.

The applicant can also open the application afterward and see the same rejection history entry, including the comment that explained the decision.

If the reviewer tries to reject without a comment, the system does not allow the decision and the application stays unchanged.

If a reviewer who is not assigned to the application tries to reject it, the system does not allow the decision and the application stays unchanged.

If someone tries to reject an application that is not eligible for rejection, the system rejects the attempt and leaves the application unchanged.

## Decisions made

| Alternative | Decision | Reasoning |
| --- | --- | --- |
| Rejection as a silent status change vs rejection with an explanation | Rejection with an explanation chosen | A rejection is a meaningful terminal decision, and the reviewer's reason should be part of the record the applicant can see. |
| Visible only to reviewers vs visible to both reviewer and applicant | Visible to both sides chosen | Both parties need the same outcome trail, and the applicant should be able to see what decision was made and why. |
| Allow rejection from any review state vs only when the application is under review | Only when the application is under review chosen | Rejection should be a controlled terminal review decision, not a generic status shortcut. |

## Constraints the journey places on implementation

- A reviewer can reject only an application that is currently under review.
- A rejection requires a non-empty comment.
- A successful rejection records the decision in the application's audit history.
- The rejection and its recorded history are visible to both reviewers and applicants.
- Invalid rejection attempts leave the application unchanged.
