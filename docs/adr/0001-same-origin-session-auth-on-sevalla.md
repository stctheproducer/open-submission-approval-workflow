# Session auth on Sevalla with proxied API routes

The application uses a Sevalla deployment shape with the backend on an `api` subdomain and the frontend on the main app domain. Sevalla redirect rules proxy `/api` requests from the frontend site to the backend service. Cookie-based session authentication and a managed PostgreSQL instance keep the deployment operationally simple while still using the browser's normal session flow.
