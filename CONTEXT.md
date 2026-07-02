# Open Submission Approval Workflow

This context describes the business language for a two-sided application review product where applicants submit applications and reviewers move them through an approval workflow.

## Language

**Application**:
A long-lived business record created by an applicant and moved through the review workflow.
_Avoid_: Submission, request, form

**Applicant**:
The user who creates an application, edits it while it is still a draft, and tracks its outcome.
_Avoid_: Submitter, requester, customer

**Reviewer**:
The user who evaluates submitted applications and decides whether to approve, reject, or return them for changes.
_Avoid_: Admin, approver, moderator

**Status transition**:
A change from one application status to another enforced by workflow rules.
_Avoid_: Update, action, step

**Audit log entry**:
An immutable record of a status transition, including who made it, when it happened, and any required comment.
_Avoid_: Comment, note, history row

**Application status**:
The workflow state an application is currently in, chosen from the system's enforced status set.
_Avoid_: Stage, phase, step

**Review start**:
The reviewer action that moves an application from `SUBMITTED` to `UNDER_REVIEW`.
_Avoid_: Open, claim, inspect

**Reviewer assignment**:
The act of associating an `UNDER_REVIEW` application with the reviewer responsible for the current review cycle.
_Avoid_: Ownership, lock, reservation

**Application submission**:
The applicant action that moves an application from `DRAFT` to `SUBMITTED`.
_Avoid_: Send, finalize, publish

**Application approval**:
The reviewer decision that accepts an application and moves it to `APPROVED`.
_Avoid_: Accept, pass, complete

**Application rejection**:
The reviewer decision that declines an application and moves it to `REJECTED`.
_Avoid_: Decline, deny, fail

**Application change request**:
The reviewer decision that returns an application for applicant revisions and moves it to `CHANGES_REQUESTED`.
_Avoid_: Revision, rework, send back

**Application draft reopening**:
The applicant action that moves an application from `CHANGES_REQUESTED` back to `DRAFT` for editing.
_Avoid_: Unlock, reopen, resume

**Option set**:
A backend-owned fixed list of allowed values exposed for UI selection and server-side validation.
_Avoid_: Enum table, lookup table, hardcoded dropdown
