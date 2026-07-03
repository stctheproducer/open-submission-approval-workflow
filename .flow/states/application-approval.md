---
capability: application-approval
---

# Application Approval — State

## Requirements

### Reviewers can approve an eligible application

- Given an eligible application is open in the reviewer area, when the assigned reviewer approves it, then the application is marked approved and the review is completed.
- Given the application is not eligible or belongs to another reviewer, when someone tries to approve it, then the product rejects the attempt and the application remains unchanged.
