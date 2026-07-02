---
capability: application-approval
change: application-approval
---

# Delta — application-approval

## ADDED

### Assigned reviewer can approve an application under review

- Given an application is waiting for review and the reviewer is assigned to it, when the reviewer approves it, then the application becomes approved.
- Given an application is waiting for review and the reviewer is not assigned to it, when the reviewer tries to approve it, then the approval is rejected and the application stays unchanged.

### Approval is visible as the end of the review cycle

- Given an application has been approved, when the reviewer or applicant views the application history, then the approval is visible as the final successful review outcome.
- Given an application has not been approved, when the reviewer or applicant views the application history, then no approval outcome is shown.

### Approval is allowed only while the application is waiting for review

- Given an application is no longer waiting for review, when a reviewer tries to approve it, then the attempt is rejected and the application stays unchanged.
- Given an application is waiting for review, when a reviewer tries to approve it, then the approval succeeds if the reviewer is assigned.

## MODIFIED

_None._

## REMOVED

_None._
