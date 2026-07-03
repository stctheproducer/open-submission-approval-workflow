---
capability: application-submission
---

# Application Submission — State

## Requirements

### Applicants can submit draft applications

- Given an authenticated applicant who owns a draft application, when they submit it, then the application leaves draft state and enters the reviewer workflow.
- Given an applicant who does not own the application, when they try to submit it, then the submission is not allowed and the application does not change.
- Given an application that is no longer draft, when someone tries to submit it, then the submission is rejected and the application does not change.

### Submission appears in the application history

- Given a successfully submitted application, when the applicant opens the application detail page, then the submission is shown within the application's visible status-transition history.
- Given an application with multiple workflow transitions, when the applicant opens the application detail page, then they can review the application's status-transition history for that same record in chronological order.
- Given a failed submission attempt, when the applicant checks the application afterward, then the application history does not show a new submission entry.

### Reopened applications create distinct resubmission history

- Given an authenticated applicant who owns an application reopened from requested changes, when they submit that same record again, then the application re-enters the reviewer workflow, becomes visible to reviewers as ready work, and its history records a distinct revision-round submission event.
- Given a reopened application that fails to submit again, when the applicant checks the application afterward, then no new revision-round submission event appears in history and the application does not enter reviewer ready work.
