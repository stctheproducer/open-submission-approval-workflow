---
capability: reviewer-queue-status-filtering
---

# Reviewer Queue Status Filtering — State

## Requirements

### Reviewers can narrow the queue by status

- Given a reviewer is viewing the queue, when they choose a workflow status, then they see only applications in that status.
- Given the reviewer clears the chosen status, when the queue updates, then they see the full queue again.
- Given the status is not available, when they try to use it, then the product rejects the choice and the queue stays on the current view.
