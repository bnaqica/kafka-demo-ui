# kafka-demo-ui

React UI for the Kafka Demo system: sign in through Keycloak, manage customers, then watch the email and analytics
services react to the Kafka events.

Part of the Kafka Demo system — see [docs/architecture.md](docs/architecture.md).

| | |
|---|---|
| Stack | React 19, Vite 8, Vitest + Testing Library, ESLint |
| Node | 22.12+ (`.nvmrc`) |
| Dev port | 5173 |
| Container | nginx, built with the Jib CLI (`jib.yaml`) |

## Prerequisites

- Node 22.12 or newer (`nvm use` reads `.nvmrc`)
- For the feature workflow in Claude Code: OpenSpec (`npm install -g @fission-ai/openspec@latest`)
- The three services running locally (`./gradlew bootRun` in each), which in turn need the
  [local-docker](../../local-docker) stacks, including Keycloak

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173, which goes straight to the Keycloak sign-in page, and sign in as `kafkaDemoAdmin` (can add, edit and delete customers and open the Emails tab) or
`kafkaDemoViewer` (read-only). The password for both is `local`. The Keycloak URL comes from `VITE_KEYCLOAK_URL` at build
time and defaults to `http://localhost:8180`. The dev server proxies the API to the services:

| Path | Service |
|---|---|
| `/api/customers` | kafka-demo-customer `localhost:8081` |
| `/api/emails` | kafka-demo-email `localhost:8082` |
| `/api/analytics` | kafka-demo-analytics `localhost:8083` |

Lists poll every 3 seconds, because email and analytics update asynchronously after a customer changes.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with API proxy |
| `npm test` | Vitest, once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | ESLint |
| `npm run build` | Production build into `dist/` |
| `npm run container` | Build, then package `dist/` onto nginx with the Jib CLI |

## Build a container (Jib)

Jib's Gradle/Maven plugins are Java-only, so the UI uses the [Jib CLI](https://github.com/GoogleContainerTools/jib/tree/master/jib-cli)
with the build file `jib.yaml` (nginx base image + `dist/` + `docker/nginx.conf`).

```bash
npm run container                                  # -> docker image kafka-demo-ui:latest
docker run --rm -p 8080:8080 kafka-demo-ui:latest  # http://localhost:8080
```

The Keycloak URL is fixed when the image is built. In the container, nginx proxies `/api/*` to `host.docker.internal:8081-8083`, i.e. services running on
your machine. Edit `docker/nginx.conf` for other environments.

## Documentation

- [docs/architecture.md](docs/architecture.md) — system overview and how the UI is put together
- [docs/api.md](docs/api.md) — the service endpoints the UI calls
- [docs/local-development.md](docs/local-development.md) — setup and troubleshooting
- [openspec/](openspec/) — spec-driven change proposals (OpenSpec)

## Contributing

Claude Code is configured for this repo (`CLAUDE.md`, `.claude/`). Claude never commits: review the
working tree and commit yourself.
