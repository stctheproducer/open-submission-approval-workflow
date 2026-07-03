# Session auth on Sevalla with proxied API routes

## Status

Accepted.

## Context

The application is a two-sided workflow app (Applicant and Reviewer) deployed on Sevalla. The frontend is a static site on the main app domain. The backend is a containerized AdonisJS app on an `api` subdomain. Sevalla redirect rules proxy `/api` requests from the frontend site to the backend service.

The browser needs to authenticate once and stay signed in across both the frontend UI and the backend API without token management in client-side code.

## Decision

Use cookie-based session authentication (`SESSION_DRIVER=cookie`) as the sole auth mechanism. The frontend API client defaults to the proxied `/api` base URL so that browser requests carry the session cookie naturally. The backend CORS config reads `CORS_ORIGIN` from the environment as a comma-separated allowlist and sets `credentials: true` so that session cookies travel on cross-origin requests between the frontend and backend origins.

In development, CORS allows all origins. In production, only the explicitly configured frontend origin is allowed.

## Consequences

- No client-side token storage or refresh logic. The browser session cookie handles auth end-to-end.
- The Sevalla `/api` proxy hides the cross-origin shape from the frontend code, which always talks to a same-origin `/api` path.
- The backend must be configured with the correct `CORS_ORIGIN` in production or session cookies will not attach to API requests.
- API endpoints are protected by server-side session checks and Bouncer authorization. Frontend route guards improve UX but are not the security boundary.
