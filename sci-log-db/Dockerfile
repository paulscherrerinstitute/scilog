# syntax=docker/dockerfile:1

# Shared foundation for every stage: OS, workdir, and chromium
# (required for PDF export, even in production).
FROM node:22.22.2-slim AS base

WORKDIR /app

RUN chown -R node:node /app

RUN apt-get update && \
    apt-get install -y chromium --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN=/usr/bin/chromium
ENV CHROME_PATH=/usr/lib/chromium/

# Full (dev + prod) dependency install. Shared by the build, development,
# and test stages below so the npm ci cost is paid once.
FROM base AS dev-deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-audit --no-fund

# Ahead-of-time TypeScript compilation. Its only job is to produce dist/
# for the production stage to copy from — not meant to be run directly.
FROM dev-deps AS build

COPY --chown=node:node . .

RUN npm run build

# Live-reload dev server. Source is bind-mounted at runtime, so tsc --watch
# recompiles from the host source — no AOT build needed here. Runs as root
# (no USER) so `npm install` works when you exec into the running container.
FROM dev-deps AS development

ENV NODE_ENV=development

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Runs the test suite once and exits. Kept separate from development so CI
# (and local `docker compose up api-test`) can build --target test without
# replicating the env vars, user, and command overrides in every caller.
FROM dev-deps AS test

ENV NODE_ENV=test \
    CI=true

COPY --chown=node:node . .

USER node

CMD ["npm", "run", "test"]

# Production-only node_modules (smaller than dev-deps). Only consumed by
# the production stage.
FROM base AS prod-deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --omit=dev --no-audit --no-fund

# Minimal runtime image: prod deps + compiled dist/ only. No source,
# no dev deps, no build tooling.
FROM base AS production

ENV NODE_ENV=production

COPY --chown=node:node package*.json ./
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "--enable-source-maps", "dist/index.js"]
