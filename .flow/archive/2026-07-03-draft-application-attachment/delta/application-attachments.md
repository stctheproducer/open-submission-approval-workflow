---
capability: application-attachments
change: draft-application-attachment
synced: 2026-07-03
---

# Delta — application-attachments

## ADDED

### Applicants can manage one current attachment on a draft application

- Given an authenticated applicant opening a draft application, when they upload a valid supporting file, then the application keeps that file as the current attachment.
- Given an authenticated applicant opening the same draft application again, when they upload a newer valid supporting file, then the application retains only the latest attachment and supersedes the prior file.
- Given a draft application attachment upload, when the file type or size is not allowed, then the change is rejected and the existing attachment state stays unchanged.
- Given a draft application that is no longer in draft, when the applicant tries to change its attachment, then the change is rejected and the attachment state stays unchanged.

## MODIFIED

_None._

## REMOVED

_None._
