---
capability: role-based-navigation
---

# Role-Based Navigation — State

## Requirements

### Signed-in users land in the area that matches their role

- Given an applicant signs in successfully, when the journey completes, then the applicant reaches the applicant area.
- Given a reviewer signs in successfully, when the journey completes, then the reviewer reaches the reviewer area.

### Role-specific areas stay closed to the wrong audience

- Given a user is not signed in, when they try to enter a role-specific area, then the product keeps them out of that area.
- Given a signed-in user whose role does not match an area, when they try to enter it, then the product keeps them out of that area.
