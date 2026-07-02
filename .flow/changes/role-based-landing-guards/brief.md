---
affects: [role-based-navigation, session-authentication]
briefed: 2026-07-02
---

# Role-Based Landing Guards — Brief

## Entry point, user goal, status

A signed-in user enters the product after authentication and wants to land in the area that matches their role. This is a new capability that turns sign-in into a usable two-sided product experience.

## Prerequisites

Signed-in identity must already exist, and the product must know which role the current user has.

## The journey, step by step

The user signs in and is taken to the part of the product that matches their role.

If the user is not signed in, they are kept out of role-specific areas and sent back toward sign-in.

If the signed-in user tries to reach the wrong role area, the product keeps them out of that area.

The user continues in the area intended for their role and can use the app from there.

## Decisions made

| Rejected alternative | Reasoning |
| --- | --- |
| One shared landing area for both roles | The product needs clear separation so each role sees the area meant for them. |
| Allowing both areas after sign-in with no boundary | The access model must keep role-specific areas aligned with the signed-in identity. |

## Constraints the journey places on implementation

- A signed-in applicant must land in the applicant area.
- A signed-in reviewer must land in the reviewer area.
- Unauthenticated users must not remain in role-specific areas.
- A signed-in user must not be able to act outside the area intended for their role.

