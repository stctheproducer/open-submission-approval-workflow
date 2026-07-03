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
- In Sevalla, set `VITE_API_URL` to the backend origin so production requests go directly to `https://open-submission-approval-wo-v6bf0.sevalla.app/`.
- Leave `VITE_API_URL` unset to use the current origin, which is useful when the frontend and backend are served together in development or tests.
