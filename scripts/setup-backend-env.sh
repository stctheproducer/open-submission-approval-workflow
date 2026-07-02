#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/apps/backend"
ENV_EXAMPLE="$BACKEND_DIR/.env.example"
ENV_FILE="$BACKEND_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "Created apps/backend/.env from .env.example"
else
  echo "apps/backend/.env already exists"
fi

if ! grep -Eq '^APP_KEY=.+$' "$ENV_FILE"; then
  echo "Generating APP_KEY for apps/backend/.env"
  pnpm --dir "$BACKEND_DIR" run db:generate-key
else
  echo "APP_KEY already present in apps/backend/.env"
fi

echo "Backend environment is ready."
