# gaming-store

The GOOFR digital games store.

# Development

The following section focuses on the development part of the project, including prerequisites, how to build and run the code, and how to contribute.

### Table of Contents

- [Prerequisites](#prerequisites)
  - [Web App](#web-app)
  - [Server App](#server-app)
  - [Docker](#docker)
  - [GNU Make](#gnu-make)
- [Applications](#applications)
  - [Quick Start](#quick-start)
  - [Web App](#web-app-1)
  - [Server App](#server-app-1)
- [Contributing](#contributing)

## Prerequisites

### Web App

The web application runs on [Node.js](https://nodejs.org/) version 20.

Install the dependencies inside the `web` directory with:

```shell
npm install
```

### Server App

The server application is written in [Go](https://go.dev/) and uses the version `1.23`.

### Docker

To run the application in containers, the [Docker Engine](https://docs.docker.com/engine/) is expected to be installed.

### GNU Make

To ensure a smooth development process, we use [GNU Make](https://www.gnu.org/software/make/) to run all necessary commands for building, testing, and deploying this project. Make files help automate these tasks, making it easier to manage complex dependencies and workflows. By using GNU Make, we can maintain consistency across different environments and streamline our development efforts.

### GCP Service Account

To enable the file upload functionality in this project, a Google Cloud Platform (GCP) service account key is required. The service account must have the `Storage Object Admin` role assigned, which grants the necessary permissions to upload files to a GCP Cloud Storage bucket. Ensure that the JSON key file for the service account is properly configured in the [application settings](https://cloud.google.com/docs/authentication/provide-credentials-adc#how-to) to authenticate.

To run the server with the file upload functionality using the [Dockerfile](Dockerfile), it is necessary to have the JSON key file in the `server` directory, named `gcp-key.json`.

## Applications

### Quick Start

In the project root directory, there is a [Makefile](Makefile) that contains some targets to help develop and build the web and server applications.

Build and run both applications in a Docker container:

```shell
make up
```

---

Or, if the goal is to run each application independently, see the following steps.

1. Start the web application in a development context:

   ```shell
   make dev-web
   ```

1. Update the server [configuration file](server/config.yml), especially regarding the database connection string

   - To run the database locally, use the [Docker Compose file](docker-compose.yml):

     ```shell
     docker compose up database
     ```

1. Start the server application in a development context:

   ```shell
   make dev-server
   ```

### Web App

The web application can be found in the `web` directory. It uses [React](https://react.dev/).

The web application contains several scripts to lint, build and run the project. To check the available scripts, run the following command inside the `web` directory:

```shell
npm run
```

### Server App

The server application can be found in the `server` directory. It contains the Go code that serves the following routes:

| Route        | Description     |
| ------------ | --------------- |
| /            | Web Application |
| /api         | REST API        |
| /api/docs/ui | Swagger UI      |

The server contains a [Makefile](server/Makefile) that defines a set of tasks that can be run to help with development. The available targets can be checked by running the following command inside the `server` directory:

```shell
make help
```

To serve the web application, the server expects the web static files to be in the `dist/web` directory.

The REST API is documented in a [Swagger Specification](https://swagger.io/specification/v3/) file ([api.yml](server/api/swagger/api.yml)) in the `api/swagger` directory. This file is also used by the server to generate the API models and server boilerplate code to handle the HTTP API (see the [generate.go](server/api/generate.go) file).

Inside the `api/swagger` directory, there is also a `ui` folder that contains the [Swagger UI](https://swagger.io/tools/swagger-ui/) that is served by the server to present the REST API documentation. See the [README.md](server/api/swagger/README.md) file in `api/swagger` for more information.

The server application requires a [PostgreSQL](https://www.postgresql.org/) database to manipulate the persistent data. There is a [Docker Compose](https://docs.docker.com/compose/) file ([docker-compose.yml](docker-compose.yml)) in the project root directory that already contains a `database` service that can be run locally.

The database migrations can be found in `database/migrations` in the `server` directory. When the server starts, it will make sure that the database is running the configured migration version. This behavior can also be configured and disabled if necessary.

Note that there is a configuration file in the `server` directory that contains some placeholder variables that allow the server to be configured. By default, the server reads the [config.yml](server/config.yml) file, but this can be overridden by setting the `CONFIG_FILE` environment variable with a path to a valid configuration file in any other directory.

## Contributing

### Branches

- The [main branch](https://github.com/GOOFR-Group/gaming-store/tree/main) contains the production code
- To develop a new feature or fix a bug, a new branch should be created based on the main branch

### Issues

- The features and bugs should exist as a [GitHub issue](https://github.com/GOOFR-Group/gaming-store/issues) with an appropriate description
- The status of the issues can be seen in the associated [GitHub project](https://github.com/orgs/GOOFR-Group/projects/6)

### Commits

- Git commits should follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)

### Pull Requests

- To merge the code into production, a pull request should be opened following the existing template to describe it, as well as the appropriate labels
- To merge the pull request, the code must pass all GitHub action checks, be approved by at least one of the code owners, and be squashed and merged

### Deployments

- After the code is merged into the main branch, there is a GitHub action that automatically builds and deploys the code to production

### Releases

- To release a new version of the project, [semantic versioning](https://semver.org/) should be followed
