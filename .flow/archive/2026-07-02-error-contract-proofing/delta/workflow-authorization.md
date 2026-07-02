---
capability: workflow-authorization
change: error-contract-proofing
synced: 2026-07-02
---

# Delta — workflow-authorization

## ADDED

### Forbidden workflow failures use one shared error contract

- Given a user is not allowed to perform an action, when the product rejects the attempt, then the response uses the shared error contract.
- Given an access failure occurs on a representative workflow surface, when the product reports the failure, then the response uses the shared error contract.

### Not-found and validation failures use one shared error contract

- Given a requested application cannot be found, when the product rejects the request, then the response uses the shared error contract.
- Given invalid input is supplied, when the product rejects the request, then the response uses the shared error contract.

## MODIFIED

_None._

## REMOVED

_None._
