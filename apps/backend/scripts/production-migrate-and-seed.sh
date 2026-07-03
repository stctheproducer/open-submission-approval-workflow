#!/usr/bin/env bash

set -euo pipefail

node ace migration:run --force
node ace db:seed
