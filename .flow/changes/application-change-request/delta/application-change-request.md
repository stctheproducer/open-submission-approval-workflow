---
capability: application-change-request
change: application-change-request
---

# Delta — application-change-request

## ADDED

### Reviewer can return an application for changes with a required comment

- Given an application is under review and the assigned reviewer is acting on it, when the reviewer chooses to return it for changes and provides a meaningful comment, then the application moves into a changes-requested state and the reason is recorded for the applicant.
- Given an application is under review, when the reviewer attempts to return it for changes without a comment, then the request is rejected and the application remains under review.
- Given an application is not under review, when a reviewer attempts to return it for changes, then the request is rejected and the application remains unchanged.

## MODIFIED

_None._

## REMOVED

_None._
