# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `src/components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

## Local API access

The frontend talks to the backend through Tuyau route paths such as `/api/v1/auth/login`.

- In local development, Vite proxies `/api` to `http://localhost:3333` from [`vite.config.ts`](/Users/stctheproducer/Developer/personal-projects/open-submission-approval-workflow/apps/frontend/vite.config.ts).
- To point the frontend at a different backend origin, set `VITE_API_URL` to that origin, for example `http://localhost:3333`.
- In production, set `VITE_API_URL` to the backend API domain, for example `https://apptest-api.chandamulenga.com`.
- The backend deployment does not need a `CORS_ORIGIN` environment variable for this setup.
