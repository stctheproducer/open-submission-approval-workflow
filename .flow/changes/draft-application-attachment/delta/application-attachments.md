---
capability: application-attachments
change: draft-application-attachment
---

# Delta — application-attachments

## ADDED

### Draft applications can carry one current supporting attachment

- Given an authenticated applicant who owns a draft application, when they add a supported file within the size limit, then the draft stores that file as its current supporting attachment.
- Given an authenticated applicant who owns a draft application with an existing attachment, when they replace it with another supported file within the size limit, then the application keeps only the newer file as the current attachment.
- Given an application that is no longer draft, when someone tries to add or replace an attachment through this journey, then the attachment change is rejected and the current attachment state does not change.
- Given a file that is not PDF, PNG, JPEG, or DOCX, or is larger than 5 MB, when the applicant tries to attach it to a draft, then the attachment change is rejected and the current attachment state does not change.

## MODIFIED

_None._

## REMOVED

_None._
