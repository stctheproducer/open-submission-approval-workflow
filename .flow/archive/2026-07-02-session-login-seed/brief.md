---
affects: [session-authentication]
briefed: 2026-07-02
---

# Session Login Seed — Brief

## Entry point, user goal, status

An internal user starts at the shared sign-in entry point and wants to sign in as either an applicant or a reviewer. This is a new capability that makes the existing session-based access path usable for both roles.

## Prerequisites

The shared sign-in experience must exist before this slice can be exercised end to end.

## The journey, step by step

The user opens the sign-in entry point and sees a way to authenticate as one of the supported roles.

The user chooses a role-appropriate set of credentials and signs in.

On success, the user is recognized as that role and can continue into the product as that signed-in person.

If the credentials are not valid, the user stays on the sign-in journey and is told the sign-in attempt did not succeed.

If the sign-in state cannot be established, the user does not appear signed in and the journey does not advance.

## Decisions made

| Rejected alternative | Reasoning |
| --- | --- |
| Separate sign-in journeys for each role | The product should share one access path and let the signed-in identity determine the role. |
| Anonymous access with role selection later | The rest of the product depends on a real signed-in identity from the start. |

## Constraints the journey places on implementation

- Both supported roles must be able to sign in through the same access path.
- A successful sign-in must establish a usable signed-in identity for the rest of the product.
- Invalid credentials must be rejected and must not create a signed-in state.
- The seed data used for development must include at least one applicant and one reviewer with documented access details.

