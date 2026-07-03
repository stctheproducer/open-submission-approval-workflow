---
capability: session-authentication
change: session-login-seed
---

# Delta — session-authentication

## ADDED

_None._

## MODIFIED

### Supported roles can sign in through one shared access path

_Was: Given an applicant or reviewer account is available, when the person signs in with valid credentials, then the product recognizes that person as signed in. Given invalid credentials, when the person attempts to sign in, then the product rejects the attempt and leaves the person signed out._

- Given an applicant or reviewer account is available, when the person signs in with valid credentials, then the product recognizes that person as signed in and knows which role that person has.
- Given invalid credentials or missing role information, when the person attempts to sign in, then the product rejects the attempt and leaves the person signed out.

## REMOVED

_None._
