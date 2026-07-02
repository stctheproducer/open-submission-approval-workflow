---
capability: application-drafts
change: application-draft-ownership
synced: 2026-07-02
---

# Delta — application-drafts

## ADDED

### Applicant-owned draft creation and editing

- Given an authenticated applicant with no current draft, when they create a new application, then the system creates a draft owned by that applicant.
- Given an authenticated applicant with draft applications, when they view their application workspace, then they see only their own applications.
- Given an authenticated applicant viewing one of their own draft applications, when they open it, then they can continue editing it.
- Given an authenticated applicant viewing a non-draft application, when they attempt to edit it, then the system rejects the change and the application remains unchanged.
- Given an authenticated applicant attempting to access another applicant's application, when they try to view or change it, then access is denied and the other applicant's application stays private.

## MODIFIED

_None._

## REMOVED

_None._
