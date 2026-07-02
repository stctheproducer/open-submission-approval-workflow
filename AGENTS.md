## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues. External PRs are not part of the triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single shared domain context with one root `CONTEXT.md` and root `docs/adr/`. The codebase is a `pnpm` monorepo managed with Turborepo, with an AdonisJS backend in `apps/backend` and a React/Vite frontend in `apps/frontend`. See `docs/agents/domain.md`.

## Assessment guardrails

- This repository is for **Assignment B: Submission & Approval Workflow** from the Open Ownership full-stack assessment.
- Optimize for the rubric over feature breadth. In order: workflow correctness, server-side authorization, meaningful tests, clear assessor-facing documentation, then optional enhancements.
- Prefer shipping a smaller but finished slice over speculative breadth. Search, notifications, richer queue tooling, and attachment versioning are post-core enhancements unless they are nearly free.

## Monorepo rules

- `pnpm` is the canonical package manager. Do not add `npm`-first instructions unless they are a compatibility note.
- The repository root is the primary operator surface. Prefer committed root scripts over ad hoc command sequences in docs and agent output.
- `pnpm dev` from the repo root is the canonical local development entry point and maps to `turbo dev`.
- Local infrastructure uses `apps/backend/compose.yml` for PostgreSQL and Mailpit. The backend and frontend run locally outside Docker during development.

## Architecture rules

- Treat `Application` as the core business record. Use the glossary in `CONTEXT.md` and do not drift to alternate terms like "submission" or "request" for the record itself.
- Keep one shared domain glossary for the product. This repo is a technical monorepo, not a multi-context domain model.
- Model workflow transitions as explicit resources around `Application`, not as a generic status patch.
- Keep applicant and reviewer route surfaces explicit and separate when their behavior differs.
- Every workflow transition must be atomic: update application state and write the audit log in the same database transaction.
- The audit log records status transitions, not generic draft edits.
- Fixed option lists belong to backend code and are exposed through API endpoints. Database columns should remain portable strings rather than database enums.
- List endpoints should include pagination and a sensible default ordering from the moment they are introduced.
- Route, controller, service, test, and UI names should mirror the workflow vocabulary already captured in `CONTEXT.md`.

## Implementation order

- Build workflow features backend-first: schema, domain/service logic, routes/controllers, tests, then frontend wiring.
- Keep controllers thin. Put workflow rules in dedicated services and keep authorization checks at the entry points, adjacent to workflow invariants.
- Use Problem Details style error envelopes from `apps/backend/app/exceptions/handler.ts` for validation, authorization, not-found, and illegal-transition responses.
- Prefer backend-provided validation messages as the source of truth. If wording needs refinement, customize it in backend validators rather than inventing a second frontend validation language.

## Documentation rules

- The root `README.md` is the assessment deliverable and the primary source of truth. App-level READMEs are supplementary workspace notes only.
- The root README should be optimized for assessor handoff first and should explicitly frame the repo as Assignment B.
- Keep the README narrative, but use rubric-aligned section labels so an assessor can find setup, workflow rules, data model, authorization, testing, trade-offs, deployment, and AI usage quickly.
- Include a small architecture diagram in the root README.
- AI usage disclosure in the final README must be specific and auditable: tool name, how it was used, and what was manually verified.
- Major architectural choices should stay aligned across code, ADRs, and the root README. If a decision materially shapes the system, document it where an assessor will see it.

## Deployment rules

- Production targets Sevalla with the backend on an `api` subdomain and the frontend on the main app domain.
- Sevalla redirects should proxy `/api` requests from the frontend app to the backend service.
- Session auth is the default production auth model. The frontend talks to the backend with cookie-based sessions, and the backend must be configured with explicit production CORS for the frontend origin.
- The backend is deployed as a containerized AdonisJS app. The frontend is deployed as a static site build. PostgreSQL is managed.

## Commit and PR rules

- Use Conventional Commits for every commit in the form `<type>(<scope>): <short imperative summary>`.
- Prefer explicit scopes tied to the changed area, such as `workflow`, `auth`, `reviewer`, `applicant`, `docs`, `deployment`, or `migrations`.
- If changes span unrelated concerns, split them into separate scoped commits.
- Every commit message must include a body with specific `- ` bullet points covering why the change was needed, what changed, and any relevant impact, risk, migration, or test notes.
- When making commits from the shell, use a heredoc so multiline commit bodies are preserved correctly.
- Before creating or materially updating a PR, read the repository PR template and use its exact structure.
- PR titles should also follow Conventional Commits.
- One PR may contain multiple closely related vertical slices from the same branch when that produces a more coherent review unit. Avoid creating extra branches when the slices are tightly coupled.
- Even when one PR contains multiple slices, keep the related issues and test coverage explicit so the reviewer can still assess each slice clearly.

## Current ADRs

- `docs/adr/0001-same-origin-session-auth-on-sevalla.md`
- `docs/adr/0002-explicit-transition-resources-for-application-workflow.md`

### AdonisJS Flow docs

<!-- FLOW-DOCS-INDEX-START -->[AdonisJS Harness Docs Index]|root: ./.flow/docs|STOP. What you remember about AdonisJS may be wrong for this project. Read the relevant harness doc first and treat it as the primary working reference for framework and app tasks.|topics:{packages.md: Catalog of every supported AdonisJS-ecosystem package and the harness docs it owns. Read this when a required harness doc is missing from this folder to identify which package the user must install before re-running `flow:install`.|routing.md: Read when defining or reorganizing routes in an AdonisJS app. Covers the recommended path for route structure, route params, resource routes, grouping, naming, and route-level middleware.|http-context.md: Read when working with request-scoped framework context in an AdonisJS app. Covers the recommended path for typing, passing, augmenting, injecting, and retrieving `HttpContext`.|request.md: Read when an action needs input from the request, uploaded files, cookies, route params, or request metadata. Covers the recommended path for trusted input and request-scoped data.|url-builder.md: Read when generating internal links or secure signed URLs from named routes in an AdonisJS app. Covers the recommended path for route-name URLs, params, query strings, frontend links, redirects, and signed-link verification.|middleware.md: Read when creating, registering, or applying HTTP middleware in an AdonisJS app. Covers where middleware belongs, how to attach it, and the recommended request-scoped patterns for middleware logic.|services.md: Read when deciding whether to extract a service from a controller action (or other caller) in an AdonisJS app, or when creating one. Covers the trigger for extracting vs keeping work inline, the naming test, service file structure, and injection from controllers.|controllers.md: Read when creating or editing controllers in an API app. Covers the recommended path for controller structure, route wiring, dependency injection, and controller responsibilities.|response.md: Read when deciding what a controller action should send back to an API client. Covers the recommended path for JSON responses, redirects in rare API flows, file responses, and response customization.|exception-handling.md: Read when deciding how application errors should be reported or turned into HTTP responses in an API app. Covers the recommended exception flow for app-specific and framework-raised errors.|transformers.md: Read when backend data must be formatted, renamed, aggregated, or reshaped before reaching an API response body. Covers the recommended transformer path for response data.|testing.md: Read when authoring or editing tests for an AdonisJS API app. Covers the recommended Japa setup, type-safe api-client requests via client.visit, auth, db reset, fakes, container swaps, and assertions on wrapped response shapes.|file-uploads.md: Read when implementing file uploads or using Drive-backed file storage in an AdonisJS app. Covers the recommended upload, persistence, and file-serving path for public and private files.|authentication.md: Read when wiring authentication in an AdonisJS app, choosing a guard, or protecting routes that require a signed-in user. Covers the recommended path for guard setup, route protection, and using the authenticated user in app code.|mail.md: Read when sending emails from an AdonisJS app or organizing reusable email delivery flows. Covers the recommended path for mailer setup, sending and queueing emails, reusable mail classes, and mail testing.|session.md: Read when storing request-to-request state, flashing messages, or using session-backed redirects in an AdonisJS app. Covers the recommended path for session values, success and error flash messages, old input, intended URLs, and session regeneration.|authorization.md: Read when gating routes or actions with authorization rules in an API app. Covers the recommended path for entry-point authorization and per-resource checks.|migrations.md: Read when changing database schema in an AdonisJS app. Covers the recommended path for creating tables, altering tables, backfilling schema-related data, and running migration workflows.|model-relationships.md: Read when connecting models, loading related data, querying through relationships, or aggregating related records. Covers the recommended relationship path for reads and writes.|models.md: Read when creating or editing Lucid models in an AdonisJS app. Covers the recommended path for model structure, CRUD behavior, hooks, scopes, and model-level data rules.|query-builder.md: Read when a Lucid query goes beyond model finders or relationship helpers. Covers the recommended path for advanced querying, aggregates, joins, and lower-level query work.|schema-rules.md: Read when generated schema types need correction or when repo-wide database typing conventions must apply across tables. Covers the recommended path for global and per-table schema rules.|transactions.md: Read when a workflow needs multiple database writes to succeed or fail together. Covers the recommended path for atomic writes, rollback behavior, row locks, and post-commit side effects.|pagination.md: Read when implementing paginated lists or paginated sub-resources in an API app. Covers the recommended query, shaping, and navigation path for pagination.|validation.md: Read when creating or changing a validator for request data or uploaded files. Covers the recommended validation path for trusted input in an AdonisJS app.}<!-- FLOW-DOCS-INDEX-END -->
<!-- FLOW-PROJECT-FACTS-START -->[Project Facts]|stack: AdonisJS 7, Lucid 22, Bouncer 4, SQLite 12, PostgreSQL 8|packageManager: pnpm|appRoot: apps/backend|node: <!-- FLOW-PROJECT-FACTS-END -->
