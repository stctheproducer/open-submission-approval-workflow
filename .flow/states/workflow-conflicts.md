---
capability: workflow-conflicts
---

# Workflow Conflicts — State

## Requirements

### Conflicting workflow attempts are rejected as real conflicts

- Given an application has already moved into a state that makes a new action invalid, when someone tries the invalid action, then the product rejects the attempt as a conflict.
- Given a workflow conflict occurs, when the user retries without changing the underlying state, then the product keeps rejecting the invalid action.
