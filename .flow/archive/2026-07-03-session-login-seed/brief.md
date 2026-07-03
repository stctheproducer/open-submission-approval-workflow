---
affects: [session-authentication, role-based-navigation]
briefed: 2026-07-03
---

# Session Login Seed — Brief

## Entry point, user goal, status

The sign-in page. An applicant or reviewer wants to sign in once and enter the correct area of the app without any extra role-selection step. This is a fix.

## Prerequisites

- A valid applicant or reviewer account exists.
- The account has the role the app needs to decide where the person should land after sign-in.

## The journey, step by step

1. The person opens the sign-in page and enters valid credentials.
2. If the credentials are wrong, the app rejects the attempt and the person stays signed out.
3. If the credentials are valid and the account role is known, the app treats the person as signed in and sends them to the area that matches that role.
4. If the credentials are valid but the account role cannot be determined, the app rejects the attempt as a failed sign-in and keeps the person out of the app.
5. A signed-in applicant reaches the applicant area.
6. A signed-in reviewer reaches the reviewer area.

## Decisions made

| Alternative | Decision | Reasoning |
| --- | --- | --- |
| Sign in first and discover the role later vs return the role as part of the successful sign-in outcome | Return the role as part of the successful sign-in outcome | The frontend needs the role immediately to land the person in the right area without a second decision point. |
| Treat missing role data as a partial sign-in vs reject it as a failed sign-in | Reject it as a failed sign-in | A partial sign-in creates an ambiguous state where the app cannot decide where the user belongs. |
| Add a separate role-selection step vs keep one shared sign-in path | Keep one shared sign-in path | The experience should stay simple for both applicants and reviewers. |

## Constraints the journey places on implementation

- A successful sign-in must identify both the person and the role needed to decide where they land.
- The app must not leave a user in a half-signed-in state when role information is missing.
- Applicants and reviewers must land in different areas that match their role.
- Wrong credentials or missing role information must leave the person signed out.
- Development access still needs at least one applicant and one reviewer available for sign-in testing.
