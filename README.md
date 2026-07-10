# SciLog

A collaborative electronic logbook for experiments at scientific user facilities.

## Why SciLog?

During an experiment, *what you did and why* is often as valuable as the data itself — yet that context is easily lost to paper notebooks or scattered tools. SciLog replaces the paper logbook with a real-time, searchable electronic record that integrates with facility authentication and data acquisition systems, so capturing context doesn't get in the way of running the experiment.

Multiple users — wherever they are — see the same state of the logbook as it evolves, and entries can be added by hand or pushed in automatically from instruments and pipelines. The result is a richer, FAIR-aligned record of the experiment that improves reproducibility and is far easier to search, share, and reuse than a paper logbook.

SciLog is developed at the Paul Scherrer Institut (PSI) and is in production use during beam time. For the design rationale, see the [ICALEPCS 2023 paper](https://doi.org/10.18429/JACoW-ICALEPCS2023-THPDP073).

## Features

- **Real-time collaboration** — everyone on a logbook sees new entries and edits the moment they happen.
- **Rich entries** — formatted text, images, file attachments, and tasks, all in one timeline.
- **Tag, filter, and sort** — organize and find entries by tag, author, time, or any metadata field.
- **Hierarchical and virtual logbooks** — group related logbooks together, or create virtual logbooks that pull in entries from across experiments via saved queries.
- **Fine-grained access control** — per-entry permissions, full edit history, and restore for deleted entries.
- **REST API and Python SDK** — push entries directly from instruments, scripts, or data acquisition pipelines.
- **Facility integrations** — pluggable authentication and automatic logbook creation from experiment proposals (used at PSI with the DUO proposal system).
- **Responsive web UI** — works on desktop, tablet, and mobile.

## Repository structure

### Frontend (angular)
The [web](./web) folder contains the [angular](https://angular.dev/) components and the Dockerfile that implement the SciLog UI.

### Backend (loopback4)
The [api](./api) folder contains the REST API backend implementation. It is implemented using [loopback4](https://loopback.io/doc/en/lb4/index.html), a [node.js](https://nodejs.org/en) framework developed by IBM. See the [backend README](./api/README.md) for development instructions.

### SDK (python)
The [sdk/python](./sdk/python) folder contains a wrapper of the backend REST APIs in python. It is currently limited to the core endpoints and doesn't yet cover all HTTP endpoints.

### Utility tools
The [importTools](./importTools) folder has common tooling scripts for integration with SciLog, using the SDK.

### Docs
The [docs](./docs) folder contains a preliminary and unpolished first draft of the documentation. It is made available [here](https://paulscherrerinstitute.github.io/scilog/) but still hasn't been officially maintained.

### Local environment
The [config](./config) folder contains configuration options for creating a local environment with docker. See the [getting started](#getting-started) section for instructions.

## Getting started

### Full stack (frontend + backend)
The easiest way to get started is using the provided [docker compose file](./config/docker-compose.yaml). Docker v2.29.0 or later is required.

Setting the compose profiles spins up the matching services. To create all of them, the backend (with some seeded data) and the frontend, run:

```bash
docker compose --profile '*' up -d
```

You can then go to `http://localhost` to access the UI and `http://localhost/api/v1/explorer` to access the backend Swagger UI (including the openAPI specs). To login use:

| Username         | Password      |
| ---------------- | ------------- |
| scilog@scilog    | scilog@scilog |

After that, you can start creating logbooks (`Add logbook`) and play around.

To change configuration options or check the default ones, have a look at the files referenced by the [docker compose file](./config/docker-compose.yaml) and their content inside the [config](./config) folder.

### Backend only
For backend development, see the [backend README](./api/README.md).

For questions or support, email us at: [scilog-help@lists.psi.ch](mailto:scilog-help@lists.psi.ch)

## License

SciLog is distributed under the [GNU General Public License v3.0 or later](./LICENSE), with one exception: the [Python SDK](./sdk/python/) is distributed under the [BSD 3-Clause License](./sdk/python/LICENSE) so it can be embedded in instrument scripts and data acquisition pipelines without inheriting copyleft obligations.

The GPLv3 choice for the web client and the REST API is driven by their incorporation of copyleft third-party components — notably CKEditor 5 (GPL-2.0-or-later) in the web client and the `ro-crate` / `ro-crate-html` packages (GPL-3.0-or-later) in the API. For an authoritative, up-to-date inventory of bundled dependencies and their licenses, run `npx license-checker --production` from the corresponding Node package root.
