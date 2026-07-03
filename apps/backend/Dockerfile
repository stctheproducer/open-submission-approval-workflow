FROM node:lts-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

# ----------------------------
# Stage 1: Install dependencies
# ----------------------------
FROM base AS deps
WORKDIR /app

COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json apps/backend/package.json

RUN pnpm install --filter @api-starter-kit/backend... --frozen-lockfile

# ----------------------------
# Stage 2: Build the backend
# ----------------------------
FROM deps AS build
WORKDIR /app

COPY apps/backend ./apps/backend

RUN pnpm --dir apps/backend exec node ace build --package-manager=pnpm

# ----------------------------
# Stage 3: Production runtime
# ----------------------------
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

COPY --from=build /app/apps/backend/build ./

RUN mkdir -p storage tmp

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3333

CMD ["node", "bin/server.js"]
