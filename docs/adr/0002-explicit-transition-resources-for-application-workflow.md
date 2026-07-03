# Explicit transition resources for application workflow

## Status

Accepted.

## Context

The assessment requires a multi-state workflow around a core `Application` record: draft, submit, start review, approve, reject, request changes, and reopen. Each transition has different authorization rules, different preconditions, and different audit requirements.

A generic `PATCH /applications/:id` with a `status` field would keep the route count low, but it would push workflow rules into the model or the request layer, make authorization harder to reason about, and produce a less explicit audit trail.

## Decision

Model each workflow transition as its own API resource with a dedicated controller, service, and route:

- `POST /applicant/applications/:id/submit` for submission
- `POST /reviewer/applications/:id/review-start` for starting review
- `POST /reviewer/applications/:id/approve` for approval
- `POST /reviewer/applications/:id/reject` for rejection
- `POST /reviewer/applications/:id/change-request` for requesting changes
- `POST /applicant/applications/:id/reopen` for reopening after changes requested

Each transition runs inside a single database transaction that updates the application state and writes the audit log entry atomically. Authorization checks live at the entry point (controller or service), adjacent to the workflow invariant they protect.

## Consequences

- More routes than a generic status patch, but each route has a single responsibility and a clear authorization boundary.
- Workflow tests can target one transition per file without setting up unrelated state.
- Illegal transitions return `409 Conflict` from a single code path, making the error contract consistent.
- The audit log captures every status change with the actor, previous state, next state, and optional comment, because the write is part of the same transaction as the state change.
