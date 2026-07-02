---
capability: workflow-authorization
change: workflow-authorization-hardening
synced: 2026-07-02
---

# Delta — workflow-authorization

## ADDED

### Applicant-owned surfaces stay limited to the owning applicant

- Given an applicant is signed in, when they access their own application surfaces, then the product allows the access.
- Given a different signed-in user, when they try to access those applicant-owned surfaces, then the product rejects the attempt.

### Reviewer actions stay limited to reviewers

- Given a user is not a reviewer, when they try to perform a reviewer action, then the product rejects the attempt.
- Given a reviewer is signed in, when they try to perform reviewer actions, then the product allows the access checks to continue.

### In-review decisions stay limited to the assigned reviewer

- Given an application is under review and assigned to one reviewer, when that reviewer completes a decision, then the product allows the decision to proceed.
- Given an application is under review and assigned to one reviewer, when a different reviewer tries to complete a decision, then the product rejects the attempt.

## MODIFIED

_None._

## REMOVED

_None._
