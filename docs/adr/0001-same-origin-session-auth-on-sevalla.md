# Session auth on Sevalla with proxied API routes

The application will be deployed on Sevalla as two separate processes with the backend on an `api` subdomain and the frontend on the main app domain. Sevalla redirect rules will proxy `/api` requests from the frontend site to the backend service. We will use cookie-based session authentication and a managed PostgreSQL instance because this keeps the deployment operationally simple while still using the browser's normal session flow.
