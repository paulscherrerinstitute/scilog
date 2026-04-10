# sci-log-db

REST API backend for SciLog, built with [LoopBack 4](https://loopback.io/doc/en/lb4/index.html).

## Quick start

Start the development environment (API + MongoDB with seed data):

```bash
docker compose up
```

The API will be available at `http://localhost:3000/api/v1/explorer`.

## Docker Compose services

| Service            | Description                                  | Profile      |
| ------------------ | -------------------------------------------- | ------------ |
| `mongo`            | MongoDB 8 replica set                        | *(default)*  |
| `mongo-seed`       | Seeds the database via `init/seed.js`        | *(default)*  |
| `api-development`  | Dev server with live reload (`npm run dev`)  | *(default)*  |
| `api-test`         | Runs the test suite                          | `test`       |
| `api-production`   | Production image (compiled JS only)          | `production` |

### Running tests

```bash
docker compose up --exit-code-from api-test api-test
```

### Building the production image

```bash
docker compose up api-production
```

## Dockerfile targets

The multi-stage Dockerfile exposes the following targets:

| Target        | Purpose                                                                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `development` | Source-mounted dev server with watch mode. Runs as root so `npm install` works when you exec into the running container (e.g. after attaching from VSCode).      |
| `test`        | Runs `npm run test` once and exits. Kept separate from `development` so CI can build `--target test` without duplicating env vars, user, and command overrides.  |
| `production`  | Minimal runtime image: prod-only `node_modules` plus compiled `dist/`. No source, no dev deps, no build tooling.                                                  |

## Configuration

Copy the example files and edit as needed:

```bash
cp datasource.example.json datasource.json
cp oidc.example.json oidc.json
cp functionalAccounts.example.json functionalAccounts.json
```

These files are git-ignored and bind-mounted into the container at runtime.
