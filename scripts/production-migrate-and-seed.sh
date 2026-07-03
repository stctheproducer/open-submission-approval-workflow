#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

pnpm --dir apps/backend exec node ace migration:run --force
pnpm --dir apps/backend exec node ace db:seed
