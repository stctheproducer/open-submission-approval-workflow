# Same-origin session auth on Sevalla

The application will be deployed on Sevalla as two separate processes behind one public origin, with path-based routing sending `/` traffic to the frontend and `/api/*` traffic to the AdonisJS backend. We will use cookie-based session authentication and a managed PostgreSQL instance because this keeps the web app same-origin, avoids cross-origin auth complexity, and matches the assessment's need for a simple, well-reasoned hosted deployment.
