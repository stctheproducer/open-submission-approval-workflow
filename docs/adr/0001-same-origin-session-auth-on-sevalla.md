# Session auth on Sevalla with an explicit API origin

## Status

Accepted.

## Context

The application is a two-sided workflow app (Applicant and Reviewer) deployed with a static frontend on Sevalla and a containerized AdonisJS backend and database on Dokploy. The frontend API client points at the backend API domain with `VITE_API_URL`.

The browser needs to authenticate once and stay signed in across both the frontend UI and the backend API without token management in client-side code.

## Decision

Use cookie-based session authentication (`SESSION_DRIVER=cookie`) as the sole auth mechanism. The frontend API client is configured with `VITE_API_URL` so browser requests go directly to the backend API domain and carry the session cookie naturally.

## Consequences

- No client-side token storage or refresh logic. The browser session cookie handles auth end-to-end.
- The frontend explicitly targets the backend origin, which keeps the deployment wiring simple.
- The backend does not need a `CORS_ORIGIN` environment variable for this deployment.
- API endpoints are protected by server-side session checks and Bouncer authorization. Frontend route guards improve UX but are not the security boundary.
