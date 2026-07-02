---
planned: 2026-07-02
---

# Application Approval — Blueprint

## Goal

Complete the reviewer approval path for `Application` records: an authenticated, assigned reviewer can approve an application that is still under review, the approval is written as an auditable status transition, and both reviewer and applicant views can show the approved outcome in the application history.

This slice stays focused on the approval transition. It does not add submission, review start, rejection, change requests, or applicant reopening.

## Main Decisions

| Decision | Why |
| --- | --- |
| Use a dedicated reviewer transition resource for approvals | Approval is a noun-shaped workflow event, not a generic status patch, so it gets its own controller and route surface under the reviewer namespace. |
| Keep session auth and enforce reviewer assignment with Bouncer | The app is same-origin session-based, and reviewer assignment is an authorization rule that belongs at the action boundary. |
| Make approval atomic in a domain service | The state change and audit log entry must commit together, and the service keeps that workflow rule out of the controller. |
| Store workflow options as backend-owned string constants | The repo convention is portable string columns plus code-owned option sets, not database enums. |
| Return the updated application with its visible history | Reviewers and applicants need the approved result and the audit trail, not a bespoke approval payload. |
| Reject stale transitions with a 409 conflict exception | Approval is only legal while the application is still under review, so the failure is a workflow conflict, not a validation error. |

## Backend Plan

### 1. Schema and workflow values

```dbml
Table users {
  id integer [pk]
  email varchar
  full_name varchar [null]
  password varchar
  role varchar
  created_at timestamp
  updated_at timestamp [null]
}

Table applications {
  id integer [pk]
  user_id integer [not null, ref: > users.id]
  reviewer_id integer [null, ref: > users.id]
  status varchar
  created_at timestamp
  updated_at timestamp [null]
}

Table application_status_transitions {
  id integer [pk]
  application_id integer [not null, ref: > applications.id]
  actor_id integer [not null, ref: > users.id]
  previous_status varchar
  next_status varchar
  comment text [null]
  created_at timestamp
  updated_at timestamp [null]
}

Indexes {
  applications (reviewer_id, status)
  application_status_transitions (application_id, created_at)
}
```

- `users.role` stores the reviewer/applicant distinction as a portable string option set.
- `applications.status` stores the workflow state as a portable string option set.
- `applications.reviewer_id` stays nullable until the application enters owned review.
- `application_status_transitions` is append-only audit data; it records who changed the state, from what, to what, and when.
- The approval slice only needs the workflow columns above; any broader application-edit fields remain part of the shared `Application` baseline.

### 2. Models and relations

- `apps/backend/app/models/user.ts`
  - Add the `role` column override and the inverse relationships needed by the workflow: owned applications and reviewer-assigned applications.
  - Keep the existing auth-finder mixin intact.
- `apps/backend/app/models/application.ts`
  - New model for the shared workflow record.
  - Add `belongsTo` relations for applicant and reviewer.
  - Add a `hasMany` relation for `statusTransitions`, ordered oldest-first so the approval appears as the final visible entry.
- `apps/backend/app/models/application_status_transition.ts`
  - New audit-log model for status transitions.
  - Add `belongsTo` relations for the application and the actor.
- `apps/backend/app/values/user_role.ts`
  - Define the backend-owned role constants (`APPLICANT`, `REVIEWER`).
- `apps/backend/app/values/application_status.ts`
  - Define the workflow status constants, including `UNDER_REVIEW` and `APPROVED`.
- Migration files in dependency order:
  - `database/migrations/<timestamp>_add_role_to_users_table.ts` - add reviewer/applicant role storage to users.
  - `database/migrations/<timestamp>_create_applications_table.ts` - create the core workflow record with applicant ownership, optional reviewer assignment, and current status.
  - `database/migrations/<timestamp>_create_application_status_transitions_table.ts` - create the immutable status-history table used by approval.

### 3. Authorization and transition service

- `apps/backend/app/policies/application_policy.ts`
  - `approve(user: User, application: Application)` allows only the reviewer role assigned to the application.
  - Keep the rule explicit in the policy instead of inlining role/ownership checks in the controller.
- `apps/backend/app/exceptions/application_transition_conflict_exception.ts`
  - Custom 409 exception for illegal workflow transitions.
  - Use it when the application is no longer under review at approval time.
  - No custom `handle()` is needed; the global handler can emit the standard API error envelope.
- `apps/backend/app/services/application_approval_service.ts`
  - `approve(application: Application, reviewer: User): Promise<Application>`
  - Run the transition inside `db.transaction(...)`.
  - Reload the application inside the transaction with a lock so the service acts on the current row, not stale controller state.
  - Refuse approval unless the application is still `UNDER_REVIEW`.
  - Set the status to `APPROVED`, save the application, and create a matching `application_status_transitions` row in the same transaction.
  - Reload the application relations needed for the response before returning.
  - Do not handle HTTP concerns, auth decisions, route params, or response shaping.

### 4. Route and controller surface

- `apps/backend/app/controllers/application_approvals_controller.ts`
  - New controller for the approval transition resource.
  - Single action: `store`.
  - Use method-level `@inject()` for the approval service because only one action needs it.
  - Flow for `store`:
    - read `applicationId` from `params`
    - load the application
    - authorize `approve` through `ApplicationPolicy`
    - call `ApplicationApprovalService.approve(...)`
    - return the updated application detail response
- `apps/backend/start/routes.ts`
  - Add a reviewer route group under `/api/v1/reviewer`.
  - Register `POST /applications/:applicationId/approvals` against `ApplicationApprovalsController.store`.
  - Apply `middleware.auth()` to the reviewer group.
  - Use `router.matchers.number()` for `applicationId` instead of a Vine validator.
  - Keep the reviewer surface separate from applicant routes.

### 5. Response shaping

- `apps/backend/app/transformers/application_transformer.ts`
  - Add or extend a detailed variant that exposes the approved application with visible history.
  - Pass-through fields: the application record fields that do not need formatting.
  - Nested fields:
    - `applicant` via `UserTransformer`
    - `reviewer` via `UserTransformer`
    - `statusTransitions` via `ApplicationStatusTransitionTransformer`
  - Preload every relationship the transformer reads.
  - Use the detailed variant for the approval response so both reviewer and applicant views can reuse the same shape.
- `apps/backend/app/transformers/application_status_transition_transformer.ts`
  - Shape each audit entry for history display.
  - Pass-through fields: `previousStatus`, `nextStatus`, `comment`, `createdAt`.
  - Nested `actor` via `UserTransformer`.
- Success response
  - `response.status(200)` then `serialize(ApplicationTransformer.transform(application).useVariant('forDetailedView'))`.
  - Return the updated application resource, not a bespoke approval payload.

### 6. Tests

- Functional tests
  - Assigned reviewer approves an application that is under review and receives `200`.
  - Unassigned reviewer gets `403` and the application stays unchanged.
  - Reviewer attempts approval after the application is no longer under review and gets `409`.
  - Success response includes the approved status and the approval entry in visible history.
- Unit tests
  - `ApplicationApprovalService` writes the status change and the audit log entry together.
  - Failed approval paths leave both the application row and the transition table unchanged.
- Test data setup
  - Create reviewers and applicants directly in the test body so the role distinction stays explicit.
  - Assert row state with `db.assertHas`, `db.assertMissing`, and `db.assertModelExists/Missing`.
  - Use route-name requests against the controller action so the tests stay aligned with the route surface.

## Implementation Order

1. Add the workflow value modules, schema changes, and model relations.
2. Add the reviewer policy, conflict exception, and approval service.
3. Wire the reviewer route and controller action.
4. Add the transformer detail shape for application history.
5. Write the functional and unit tests.

## Explicit Non-Goals

- No submission route or submission history work.
- No review-start queue work.
- No rejection or change-request routes.
- No applicant reopening flow.
- No frontend changes in this slice.
- No notification, mail, or attachment handling.
