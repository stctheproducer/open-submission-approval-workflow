---
capability: api-error-responses
change: api-error-responses
synced: 2026-07-03
---

# Delta — api-error-responses

## ADDED

### API failures use a single RFC 9457 problem-details shape

- Given any API request that fails with a thrown exception, when the client receives the response, then the error follows one RFC 9457 problem-details shape across the API.
- Given a validation, authorization, not-found, conflict, or similar request failure, when the API responds, then the client receives the same problem-details shape instead of a different ad hoc error envelope.
- Given a request failure that is not part of the API error contract, when the client receives the response, then the client does not receive a misleading success-style payload.

## MODIFIED

_None._

## REMOVED

_None._
