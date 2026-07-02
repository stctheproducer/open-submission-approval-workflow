---
capability: session-authentication
change: session-login-seed
synced: 2026-07-02
---

# Delta — session-authentication

## ADDED

### Supported roles can sign in through one shared access path

- Given an applicant or reviewer account is available, when the person signs in with valid credentials, then the product recognizes that person as signed in.
- Given invalid credentials, when the person attempts to sign in, then the product rejects the attempt and leaves the person signed out.

### Seeded development identities are available for both roles

- Given a fresh development environment, when the product is prepared for use, then at least one applicant and one reviewer are available for sign-in testing.
- Given the documented development access details are missing or wrong, when someone tries to use them, then sign-in cannot be completed.

## MODIFIED

_None._

## REMOVED

_None._
