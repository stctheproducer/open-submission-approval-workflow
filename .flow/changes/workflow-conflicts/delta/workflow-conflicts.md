---
capability: workflow-conflicts
change: workflow-conflicts
---

# Delta — workflow-conflicts

## ADDED

### Illegal workflow actions are rejected as conflicts

- Given an application has already moved to a state where the requested workflow action is no longer valid, when a user tries that action, then the system rejects it as a conflict and leaves the application unchanged.
- Given a workflow action is still valid for the application, when the user performs it, then the system accepts it and the workflow continues normally.

### Workflow failures share one consistent error contract

- Given a workflow action fails because of validation, authorization, not-found, or conflict, when the client receives the response, then the failure follows the same overall API contract.
- Given the same kind of workflow failure occurs on different workflow routes, when the client receives the responses, then the error behavior is consistent across those routes.

### Workflow conflict behavior is verifiable across the main workflow transitions

- Given the main workflow transitions already introduced by earlier slices, when an illegal transition is attempted on any of them, then the response clearly indicates a workflow conflict.
- Given those same transitions are exercised with valid input and allowed state, when the action is attempted, then the workflow still succeeds as expected.

## MODIFIED

_None._

## REMOVED

_None._
