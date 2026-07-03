---
capability: application-drafts
change: application-read-history
synced: 2026-07-03
---

# Delta — application-drafts

## ADDED

### Applicants can review draft application details

- Given an authenticated applicant who owns a draft application, when they open that application from their workspace, then they can review the current application status and record details.
- Given an applicant attempting to open a draft application they do not own, when they try to access that record, then the application stays private and its details are not revealed.

## MODIFIED

### Applicant-owned draft creation and editing

_Was: Applicants could view their own applications in a workspace and reopen owned drafts for editing, while foreign applications stayed private._

- Given an authenticated applicant with no current draft, when they create a new application, then the system creates a draft owned by that applicant.
- Given an authenticated applicant with applications they own, when they view their application workspace, then they see only their own applications in a paginated list with sensible default ordering.
- Given an authenticated applicant viewing one of their own draft applications, when they open it, then they can review the application and continue editing it.
- Given an authenticated applicant viewing a non-draft application, when they attempt to edit it, then the system rejects the change and the application remains unchanged.
- Given an authenticated applicant attempting to access another applicant's application, when they try to view or change it, then access is denied and the other applicant's application stays private.

## REMOVED

_None._
