# syntax=docker/dockerfile:1@sha256:4edf897a3ffa55b89f906fc8cc78afdb3f1834cc9c7083565e611a8a7d5fe99e

# Full dependency install. Shared by the build and test stages, and used
# directly as the dev compose target (source is bind-mounted there).
FROM node:22.23.3-slim@sha256:43ac6c60b8f89723f746e8a92ce91abd5017e627ce1ddfe4238355d3a30b772c AS deps

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
FROM nginxinc/nginx-unprivileged:1.31-alpine@sha256:26b0bf6fbf07297983cb341998d79c831508787de26627dd2a112321b9c3a4af AS production

COPY --from=build /frontend/dist/ /usr/share/nginx/html/
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

USER nginx

EXPOSE 8080
