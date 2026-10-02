# syntax=docker/dockerfile:1

# Full dependency install. Shared by the build and test stages, and used
# directly as the dev compose target (source is bind-mounted there).
FROM node:22.23.3-slim AS deps

WORKDIR /frontend

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-audit --no-fund

# Production bundle. angular.json uses the legacy :browser builder, so
# the output lands directly in dist/ (no browser/ subdirectory).
FROM deps AS build

COPY . .

RUN npm run build -- --configuration production --output-path=dist

# Unit tests. Chromium is only needed by karma, so it lives in
# this leaf stage instead of slowing down every production build.
FROM deps AS test

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        chromium && \
    rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN=/usr/bin/chromium

COPY . .

CMD ["npm", "run", "test"]

# Static file server for the compiled bundle. The unprivileged image runs
# as uid 101 and listens on 8080 instead of 80.
FROM nginxinc/nginx-unprivileged:1.31-alpine AS production

COPY --from=build /frontend/dist/ /usr/share/nginx/html/
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

USER nginx

# Checks that nginx serves the app's start page.
HEALTHCHECK --start-period=30s --start-interval=2s \
    CMD ["curl", "--fail", "--silent", "--show-error", \
         "--output", "/dev/null", "http://localhost:8080/"]

EXPOSE 8080
