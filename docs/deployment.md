# Nexus Deployment Guide

## Deployment Targets

Nexus ships with:

- `infrastructure/docker/Dockerfile.api` for the API service
- `infrastructure/docker/Dockerfile.web` for the web service
- `infrastructure/docker/docker-compose.dev.yml` for local development
- `infrastructure/docker/docker-compose.production.yml` for production-style deployment
- `.github/workflows/deploy.yml` for CI/CD orchestration

## Prerequisites

Before deploying, ensure you have:

- Docker and Docker Compose v2
- Access to GHCR (or another compatible OCI registry)
- Production secrets for PostgreSQL, Redis, JWT, email, and optional third-party integrations
- A host, VM, or orchestrator capable of exposing ports `3000` and `3001`

## Container Images

### API image

Builds from `apps/nexus-api` and starts with:

```bash
node dist/index.js
```

The API image exposes port `3000` and publishes a health endpoint at `/health`.

### Web image

Builds from `apps/nexus-web`. The Dockerfile supports an optional build step if a `build` script is added later. The runtime currently expects `dist/index.js`, so confirm the web workspace provides that artifact before a production rollout.

## Environment Variables

### Infrastructure-level variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `POSTGRES_PASSWORD` | Yes | Password for the production PostgreSQL container and API connection string. |
| `REDIS_PASSWORD` | Yes | Password for the production Redis container and API Redis URL. |
| `DOCKER_REGISTRY` | No | Registry prefix, defaults to `ghcr.io`. |
| `IMAGE_TAG` | No | Image tag to deploy, defaults to `latest`. |
| `API_URL` | No | Public or internal API base URL used by the web service. |

### API application variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Yes | Runtime mode (`production`, `development`, `test`). |
| `PORT` | Yes | HTTP listen port, defaults to `3000`. |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `REDIS_URL` | Recommended | Redis connection string for queue-backed features. |
| `JWT_SECRET` | Yes | JWT signing secret. |
| `JWT_EXPIRES_IN` | No | JWT TTL, defaults to `7d`. |
| `EMAIL_FROM` | Yes for email features | Sender address for transactional emails. |
| `RESEND_API_KEY` | Yes for email features | Resend API credential. |
| `OPENAI_API_KEY` | Yes for AI features | OpenAI credential for intelligence services. |
| `R2_BUCKET_NAME` | Yes for storage features | Object storage bucket name. |
| `R2_ENDPOINT` | Yes for storage features | R2/S3-compatible endpoint. |
| `R2_ACCESS_KEY_ID` | Yes for storage features | Object storage access key. |
| `R2_SECRET_ACCESS_KEY` | Yes for storage features | Object storage secret key. |
| `R2_PUBLIC_URL` | No | Public asset base URL. |
| `SENTRY_DSN` | No | Error monitoring DSN. |
| `POSTHOG_API_KEY` | No | Analytics API key. |
| `POSTHOG_HOST` | No | Analytics host, defaults to PostHog Cloud. |

### Web application variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Yes | Runtime mode. |
| `NEXT_PUBLIC_API_URL` | Yes | API endpoint consumed by the web runtime. |

## Local Development

Start the dev stack from the repository root:

```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up --build
```

This stack provides:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- API on `http://localhost:3000`
- Web on `http://localhost:3001`

## Production Deployment with Compose

1. Create a production environment file (for example `.env.production`) with app-specific secrets.
2. Export infrastructure secrets in the shell or host environment.
3. Pull and start the stack:

```bash
export POSTGRES_PASSWORD='replace-me'
export REDIS_PASSWORD='replace-me'
export IMAGE_TAG='sha-abcdef0'
docker compose -f infrastructure/docker/docker-compose.production.yml pull
docker compose -f infrastructure/docker/docker-compose.production.yml up -d
```

## Health Checks and Verification

### Docker health checks

- PostgreSQL: `pg_isready -U nexus -d nexus`
- Redis: `redis-cli ping`
- API: `wget -qO- http://localhost:3000/health`

### Post-deploy validation

Run these checks after rollout:

```bash
docker compose -f infrastructure/docker/docker-compose.production.yml ps
curl -f http://localhost:3000/health
```

Recommended manual checks:

- Confirm API responses for critical routes.
- Confirm database migrations were applied.
- Confirm Redis-backed features work if enabled.
- Confirm email and storage integrations using a staging-safe workflow.

## GitHub Actions Deployment Workflow

The deploy workflow runs on pushes to `main` and manual dispatches.

Pipeline stages:

1. **Test** — runs `npm ci` and `npm test` for both apps.
2. **Build & Push** — builds Docker images and publishes tags to GHCR.
3. **Deploy** — placeholder job for environment-specific rollout commands.

To finish production automation, replace the placeholder deploy step with your real commands, such as:

- `docker compose pull && docker compose up -d`
- Kubernetes manifest apply or Helm upgrade
- SSH-based rollout to a target host

## Rollback Strategy

- Keep previous image tags available in GHCR.
- Re-run deployment with an earlier `IMAGE_TAG`.
- If a schema migration is not backward compatible, use staged rollout and explicit backup procedures before promotion.

## Security Notes

- Never commit real secrets to `.env.production`.
- Prefer GitHub environment secrets or a dedicated secret manager.
- Rotate JWT, database, Redis, email, and storage credentials regularly.
- Restrict direct access to PostgreSQL and Redis to internal networks only.
