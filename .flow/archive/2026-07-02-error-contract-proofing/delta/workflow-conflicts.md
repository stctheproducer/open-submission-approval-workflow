---
capability: workflow-conflicts
change: error-contract-proofing
synced: 2026-07-02
---

# Delta — workflow-conflicts

## ADDED

### Conflict failures use one shared error contract

- Given an invalid workflow action is attempted, when the product rejects it, then the response uses the shared error contract.
- Given a user retries the same invalid action without changing anything, when the product rejects it again, then the response still uses the shared error contract.

## MODIFIED

_None._

## REMOVED

_None._
