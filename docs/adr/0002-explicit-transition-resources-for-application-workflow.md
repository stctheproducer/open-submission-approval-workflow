# Explicit transition resources for application workflow

The application workflow models status changes as explicit transition resources around a core `Application` record instead of a generic status patch endpoint. Each transition executes inside a single database transaction that updates the application state and writes an audit log entry together, because the assessment prioritizes workflow correctness, authorization clarity, and an auditable history over minimizing route count.
