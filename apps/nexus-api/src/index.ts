import express, { NextFunction, Request, Response } from "express";
import { env } from "./config/env";
import { runMigrations } from "./database/connection";
import authRouter from "./routes/auth";
import billingRouter from "./routes/billing";
import brandsRouter from "./routes/brands";
import chefDrewRouter from "./routes/chef-drew";
import documentsRouter from "./routes/documents";
import evolutionRouter from "./routes/evolution";
import goalsRouter from "./routes/goals";
import objectivesRouter from "./routes/objectives";
import packagesRouter from "./routes/packages";
import pdfRouter from "./routes/pdf";
import projectsRouter from "./routes/projects";
import researchRouter from "./routes/research";
import storageRouter from "./routes/storage";
import { logError, logInfo, logRequest, logWarn } from "./services/logger";

const app = express();

function buildCorsMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cors = require("cors") as (
      options?: Record<string, unknown>
    ) => (req: Request, res: Response, next: NextFunction) => void;
    return cors({ origin: true, credentials: true });
  } catch {
    logWarn("cors_unavailable", { reason: "cors package not installed" });
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }
}

app.use(buildCorsMiddleware());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    logRequest({
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.ip,
      userAgent: req.get("user-agent") ?? undefined,
    });
  });
  next();
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, environment: env.NODE_ENV });
});

app.use("/api/auth", authRouter);
app.use("/api/billing", billingRouter);
app.use("/api/brands", brandsRouter);
app.use("/api/chef-drew", chefDrewRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/evolution", evolutionRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/objectives", objectivesRouter);
app.use("/api/packages", packagesRouter);
app.use("/api/pdf", pdfRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/research", researchRouter);
app.use("/api/storage", storageRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logError("api_unhandled_error", {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  res.status(500).json({ error: "Internal server error" });
});

async function startServer(): Promise<void> {
  await runMigrations();
  app.listen(env.PORT, () => {
    logInfo("api_server_started", { port: env.PORT, environment: env.NODE_ENV });
  });
}

if (require.main === module) {
  void startServer().catch((err: unknown) => {
    logError("api_server_start_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    process.exitCode = 1;
  });
}

export default app;
