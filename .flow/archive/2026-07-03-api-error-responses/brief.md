---
affects: [api-error-responses]
briefed: 2026-07-03
---

# API Error Responses — Brief

## Entry point, user goal, status

An API client receives an error response after a failed request and wants every thrown failure to be represented in one consistent problem-details shape. This is a new API-level contract change.

## Prerequisites

- Existing authenticated and unauthenticated API journeys that can already fail with validation, authorization, not-found, conflict, and other request errors.

## The journey, step by step

1. The client makes a request that fails for a known API reason such as validation, authorization, not-found, conflict, or a similar request failure.
2. The client receives a standardized problem-details document for that failure instead of a mixed set of ad hoc error envelopes.
3. The standardized response gives the client enough information to understand what failed and how the error should be interpreted across API surfaces.
4. When the request fails for a different thrown API exception, the client still receives the same problem-details shape.
5. When a request fails outside the API error contract, the client does not receive a misleading success-style response.

## Decisions made

| Decision | Options considered | Chosen | Why |
| --- | --- | --- | --- |
| Error shape | Mixed ad hoc envelopes vs one RFC 9457 problem-details shape | One RFC 9457 problem-details shape | Clients should not have to branch on different failure formats per endpoint. |
| Failure scope | Only validation and auth errors vs every thrown API exception | Every thrown API exception | The error contract should be consistent across the whole API surface. |

## Constraints the journey places on implementation

- Every thrown API exception must return the same RFC 9457-style problem-details shape.
- Validation, authorization, not-found, conflict, and similar request failures must not leak alternate error envelopes.
- The client must be able to treat API failures consistently across all endpoints.
