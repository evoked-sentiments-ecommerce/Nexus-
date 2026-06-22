# Nexus Architecture

## Overview

Nexus is organized as a two-application Node.js workspace:

- `apps/nexus-api` is an Express + TypeScript backend that exposes HTTP APIs, runs startup migrations, and integrates with external services.
- `apps/nexus-web` currently contains TypeScript domain utilities and tests for frontend-oriented business logic.
- `infrastructure/docker` contains container and Compose definitions for local and production-style deployments.
- `.github/workflows` contains CI/CD automation.

## Repository Layout

```text
apps/
  nexus-api/
    src/
      config/
      database/
      middleware/
      routes/
      services/
      templates/
    tests/
  nexus-web/
    src/utils/
    tests/
infrastructure/docker/
.github/workflows/
docs/
```

## Runtime Components

### 1. API service (`apps/nexus-api`)

The API boots from `src/index.ts` and provides:

- `GET /health` for liveness checks.
- Route groups for auth, billing, brands, Chef Drew, documents, evolution, objectives, packages, PDF, projects, research, and storage.
- Structured request and error logging.
- Automatic database migration execution during startup.

### 2. Web service (`apps/nexus-web`)

The web workspace currently focuses on business logic utilities and tests. The production Docker image is prepared for a compiled runtime entrypoint (`dist/index.js`) once a web server or app build step is added.

### 3. PostgreSQL

PostgreSQL is the system-of-record data store for the API. The API uses `DATABASE_URL` to lazily initialize a connection pool and applies SQL migrations from `src/database/migrations` during startup.

### 4. Redis

Redis supports asynchronous and queue-oriented workloads. The BullMQ integration in `src/services/queue/index.ts` degrades gracefully if Redis is unavailable or disabled.

## Service Boundaries

### API layers

- **Configuration:** `src/config/env.ts` centralizes environment variable access.
- **HTTP layer:** `src/routes/*` defines endpoint groups.
- **Middleware:** auth and request instrumentation live under `src/middleware` and `src/index.ts`.
- **Persistence:** `src/database/connection.ts` and `src/database/repositories` manage PostgreSQL interactions.
- **Domain services:** `src/services/*` contains business workflows such as packaging, PDF generation, storage, research, and AI-assisted flows.
- **Templates:** email templates live in `src/templates`.

### External integrations

The backend already has integration points for:

- PostgreSQL (`pg`)
- Redis / BullMQ
- JWT authentication
- Resend email delivery
- Cloudflare R2-style object storage
- OpenAI-backed intelligence features

## Request and Processing Flow

1. A client calls the API or web application.
2. The API applies CORS, JSON parsing, URL-encoded parsing, and request logging.
3. Route handlers validate input and dispatch to repositories or domain services.
4. Services may interact with PostgreSQL, Redis, email delivery, storage, or AI integrations.
5. The API returns JSON responses and logs request metadata.

Background job flow:

1. API code enqueues work through BullMQ when Redis is configured.
2. Workers consume jobs and delegate execution to agent services.
3. If Redis is unavailable, queue helpers fall back to no-op behavior instead of crashing startup.

## Deployment Topology

### Production Compose topology

`docker-compose.production.yml` defines:

- `postgres` on the internal network only
- `redis` on the internal network only
- `nexus-api` on internal + external networks, exposed on port `3000`
- `nexus-web` on internal + external networks, exposed on port `3001`

This separates backing services from public ingress while allowing app-to-app communication.

### Development Compose topology

`docker-compose.dev.yml` exposes PostgreSQL and Redis locally and mounts application source into containerized builder images for faster iteration.

## Health, Resilience, and Security

- API containers expose a `/health` endpoint used by Docker health checks.
- PostgreSQL readiness uses `pg_isready`.
- Redis has a container health check in production.
- Containers run as a non-root `nexus` user in the runtime stage.
- Secrets are injected through environment variables or `.env.production`, not hardcoded in application code.
- JWT signing, database credentials, Redis credentials, and third-party API keys should be rotated and environment-specific.

## CI/CD

The deploy workflow:

1. Runs tests for `nexus-api` and `nexus-web`.
2. Builds and pushes API and web images to GHCR.
3. Provides a deployment job scaffold for production rollout logic.

## Operational Notes

- The API can start in a degraded mode if some optional integrations are absent.
- The web container contract assumes a future compiled server artifact; align the web build/runtime commands with the eventual frontend framework before live deployment.
- Production rollout should include real deployment commands, secret provisioning, and environment-specific approvals.
