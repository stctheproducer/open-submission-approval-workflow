---
capability: application-rejection
change: application-rejection-comment
---

# Delta — application-rejection

## ADDED

### Reviewers can reject an under-review application with a required comment

- Given an authenticated reviewer who is assigned to an application that is under review, when they reject it with a non-empty comment, then the application moves to the rejected outcome and the decision is recorded.
- Given an authenticated reviewer who is assigned to an application that is under review, when they try to reject it without a comment, then the rejection is not allowed and the application does not change.
- Given a reviewer who is not assigned to the application, when they try to reject it, then the rejection is not allowed and the application does not change.
- Given an application that is not eligible for rejection, when someone tries to reject it, then the rejection is rejected and the application does not change.

### Rejection history is visible to reviewers and applicants

- Given a successfully rejected application, when a reviewer opens the application afterward, then the rejection appears in the visible history.
- Given a successfully rejected application, when the applicant opens the application afterward, then the rejection appears in the visible history.
- Given a rejection that was not allowed, when either side checks the application afterward, then no new rejection history entry appears.

## MODIFIED

_None._

## REMOVED

_None._
