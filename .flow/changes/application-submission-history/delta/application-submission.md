---
capability: application-submission
change: application-submission-history
---

# Delta — application-submission

## ADDED

### Applicants can submit draft applications

- Given an authenticated applicant who owns a draft application, when they submit it, then the application leaves draft state and enters the reviewer workflow.
- Given an applicant who does not own the application, when they try to submit it, then the submission is not allowed and the application does not change.
- Given an application that is no longer draft, when someone tries to submit it, then the submission is rejected and the application does not change.

### Submission appears in the application history

- Given a successfully submitted application, when the applicant opens the application detail page, then the submission is shown as the first visible history entry.
- Given a failed submission attempt, when the applicant checks the application afterward, then the application history does not show a new submission entry.

## MODIFIED

_None._

## REMOVED

_None._
