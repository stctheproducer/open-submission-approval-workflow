---
capability: application-drafts
---

# Application Drafts — State

## Requirements

### Applicant-owned draft creation and editing

- Given an authenticated applicant with no current draft, when they create a new application, then the system creates a draft owned by that applicant and ready for the full application shape.
- Given an authenticated applicant with draft applications, when they view their application workspace, then they see only their own applications in a paginated list with sensible default ordering.
- Given an authenticated applicant viewing one of their own draft applications, when they open it, then they can review the application and continue editing the title, category, description, amount, and supporting file.
- Given an authenticated applicant viewing a non-draft application, when they attempt to edit it, then the system rejects the change and the application remains unchanged.
- Given an authenticated applicant attempting to access another applicant's application, when they try to view or change it, then access is denied and the other applicant's application stays private.

### Applicants can review draft application details

- Given an authenticated applicant who owns a draft application, when they open that application from their workspace, then they can review the current application status and record details including the title, category, description, amount, and any supporting file.
- Given an applicant attempting to open a draft application they do not own, when they try to access that record, then the application stays private and its details are not revealed.

### Applicants can reopen requested-changes applications back to draft

- Given an authenticated applicant who owns an application in requested changes, when they explicitly reopen that record, then the same application returns to draft so editing can resume with the same draft details.
- Given an application that is not in requested changes, when someone tries to reopen it to draft through this journey, then the action is rejected and the application stays in its current state.
- Given an applicant attempting to reopen another applicant's requested-changes application, when they try to perform the reopen action, then the application stays private and unchanged.

### Applicants can attach and replace one supporting file on a draft application

- Given a draft application, when the applicant adds a supporting file, then that file becomes part of the draft application.
- Given a draft application that already has a supporting file, when the applicant adds a new one, then the new file replaces the previous file.
- Given a submitted or otherwise locked application, when the applicant tries to change the supporting file, then the application stays unchanged.
