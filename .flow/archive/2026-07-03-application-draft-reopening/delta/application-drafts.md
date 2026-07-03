---
capability: application-drafts
change: application-draft-reopening
synced: 2026-07-03
---

# Delta — application-drafts

## ADDED

### Applicants can reopen requested-changes applications back to draft

- Given an authenticated applicant who owns an application in requested changes, when they explicitly reopen that record, then the same application returns to draft so editing can resume.
- Given an application that is not in requested changes, when someone tries to reopen it to draft through this journey, then the action is rejected and the application stays in its current state.
- Given an applicant attempting to reopen another applicant's requested-changes application, when they try to perform the reopen action, then the application stays private and unchanged.

## MODIFIED

_None._

## REMOVED

_None._
