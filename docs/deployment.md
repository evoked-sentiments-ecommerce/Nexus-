# Nexus Deployment Guide

This document covers all supported deployment paths for the Nexus platform.

---

## Prerequisites

- **Node.js 20+**
- **npm 10+**
- **Docker 24+** and **Docker Compose v2** (for Docker deployments)
- A copy of this repository cloned locally

---

## Local Development

Run the API and web app directly on your machine without Docker.

### 1. Install dependencies

```bash
# API
cd apps/nexus-api
npm install

# Web
cd ../nexus-web
npm install
```

### 2. Start the API

```bash
cd apps/nexus-api
npm run dev
# API available at http://localhost:3000
```

### 3. Start the web app

```bash
cd apps/nexus-web
API_URL=http://localhost:3000 npm run dev
# Web available at http://localhost:3001
```

---

## Docker Deployment

Build and run both services using Docker Compose.

### 1. Build images

From the repository root:

```bash
docker compose -f infrastructure/docker/docker-compose.production.yml build
```

### 2. Start services

```bash
docker compose -f infrastructure/docker/docker-compose.production.yml up -d
```

Services will be available at:

| Service    | URL                   |
|------------|-----------------------|
| API        | http://localhost:3000 |
| Web        | http://localhost:3001 |

### 3. View logs

```bash
docker compose -f infrastructure/docker/docker-compose.production.yml logs -f
```

### 4. Stop services

```bash
docker compose -f infrastructure/docker/docker-compose.production.yml down
```

### Environment variables

Copy the example below into a `.env` file at the repository root and pass it to Docker Compose:

```bash
docker compose -f infrastructure/docker/docker-compose.production.yml --env-file .env up -d
```

Required variables:

| Variable               | Description                          |
|------------------------|--------------------------------------|
| `DATABASE_URL`         | PostgreSQL or other DB connection URL |
| `STRIPE_SECRET_KEY`    | Stripe secret key (billing)          |
| `STRIPE_WEBHOOK_SECRET`| Stripe webhook signing secret        |
| `API_URL`              | Internal API URL seen by the web app |

### Building individual images

```bash
# API image
docker build -f infrastructure/docker/Dockerfile.api -t nexus-api:latest .

# Web image (pass API_URL at build time)
docker build -f infrastructure/docker/Dockerfile.web \
  --build-arg API_URL=http://nexus-api:3000 \
  -t nexus-web:latest .
```

---

## Railway Deployment

[Railway](https://railway.app) can deploy both services from the existing Dockerfiles.

### 1. Install the Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 2. Create a new project

```bash
railway init
```

### 3. Add services

Add two services in the Railway dashboard — one for `nexus-api` and one for `nexus-web` — and point each to the corresponding Dockerfile:

| Service     | Dockerfile                                    |
|-------------|-----------------------------------------------|
| `nexus-api` | `infrastructure/docker/Dockerfile.api`        |
| `nexus-web` | `infrastructure/docker/Dockerfile.web`        |

### 4. Set environment variables

In the Railway dashboard under each service's **Variables** tab, add:

- `NODE_ENV=production`
- `PORT=3000` (API) / `PORT=3001` (Web)
- `API_URL=<railway-api-service-url>` (Web only)
- `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (as needed)

### 5. Deploy

```bash
# Deploy from CLI
railway up --service nexus-api
railway up --service nexus-web
```

Or push to `main` — the GitHub Actions workflow includes commented-out Railway steps ready to uncomment.

---

## Vercel Deployment

[Vercel](https://vercel.com) is the recommended host for the Next.js web app (`nexus-web`).

### 1. Link the project

```bash
cd apps/nexus-web
npx vercel link
```

### 2. Set environment variables

In the Vercel dashboard under **Settings → Environment Variables**, add:

| Variable   | Value                            |
|------------|----------------------------------|
| `API_URL`  | URL of your deployed `nexus-api` |

### 3. Deploy

```bash
npx vercel --prod
```

Or push to `main` — the GitHub Actions workflow includes commented-out Vercel steps ready to uncomment.

> **Note:** For the API (`nexus-api`) on Vercel, use Vercel Serverless Functions or deploy the API separately to Railway, Render, or a VPS and point `API_URL` at it.

---

## GitHub Actions CI/CD

The workflow at `.github/workflows/deploy.yml` runs on every push to `main` and on pull requests.

### Jobs

| Job      | Trigger                  | Description                                      |
|----------|--------------------------|--------------------------------------------------|
| `build`  | push + PR to `main`      | Install deps, type-check, run tests              |
| `docker` | push to `main` only      | Build and push images to GitHub Container Registry |
| `deploy` | push to `main` only      | Deploy to Railway or Vercel (configure and uncomment) |

### Required secrets

Add the following in **Settings → Secrets and variables → Actions**:

| Secret                  | Used by             |
|-------------------------|---------------------|
| `GITHUB_TOKEN`          | Built-in (GHCR push)|
| `RAILWAY_TOKEN`         | Railway deploy step |
| `VERCEL_TOKEN`          | Vercel deploy step  |
| `VERCEL_ORG_ID`         | Vercel deploy step  |
| `VERCEL_PROJECT_ID`     | Vercel deploy step  |
| `API_URL`               | Web Docker build arg|

### Enabling deployment

1. Choose Railway or Vercel (or both).
2. Add the required secrets above.
3. Uncomment the relevant deploy step(s) in `.github/workflows/deploy.yml`.
4. Push to `main`.

---

## Health Check

The API exposes a `/health` endpoint used by Docker Compose's health check and load balancers. Implement it in your Express entry point:

```ts
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
```
