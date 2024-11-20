# SciLog

Capturing both raw and metadata during an experiment is of the utmost importance, as it provides valuable context for the decisions made during the experiment and the acquisition strategy. However, logbooks often lack seamless integration with facility-specific services such as authentication and data acquisition systems and can prove to be a burden, particularly in high-pressure situations, for example, during experiments. To address these challenges SciLog has been developed at the Paul Scherrer Institut. Its primary objective is to provide a flexible and extensible environment, as well as a user-friendly interface. SciLog relies on atomic entries in a database that can be easily queried, sorted, and displayed according to the user's requirements. The integration with facility-specific authorization systems and the automatic import of new experiment proposals enable a user experience that is specifically tailored for the challenging environment of experiments conducted at large research facilities. The system is currently in use during beam time at the Paul Scherrer Institut, where it is collecting valuable feedback from scientists to enhance its capabilities.

## Functionalities
To get an overview of the main SciLog features and design please refer to the [official paper](https://doi.org/10.18429/JACoW-ICALEPCS2023-THPDP073). As explained [here](#docs), the GitHub-generated documentation is not yet officially supported.

## Repository structure

### Frontend (angular)
The [scilog](./scilog) folder contains the [angular](https://angular.dev/) components and the Dockerfile that implement the SciLog UI.

### Backend (loobpack4)
The [sci-log-db](./sci-log-db) folder contains REST API based backend implementation. It is implemented using [loopback4](https://loopback.io/doc/en/lb4/index.html), a [node.js](https://nodejs.org/en) framework developed by IBM.

### SDK (python)
The [sdk/python](./sdk/python) folder contains a wrapper of the backend REST APIs in python. It is currently limited to the core endpoints and doesn't yet cover all HTTP endpoints.

### Examples
The [demo](./demo) folder has examples of usage of the python SDK.

### Utility tools
The [importTools](./importTools) folder has common tooling scripts for integration with SciLog, using the SDK.

### Docs
The [docs](./docs) folder contains a preliminary and unpolished first draft of the documentation. It is made available [here](https://paulscherrerinstitute.github.io/scilog/) but still hasn't been officially maintained.

### Local environment
The [config](./config) folder contains configuration options for creating a local environment with docker. See the [getting started](#getting-started) section for instructions.

## Getting started
The easiest way to get started is using the provided [docker compose file](./config/docker-compose.yaml). The docker version must be later than 2.29.0 to support this project.

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
