import { Request, Response, Router } from "express";
import {
  parsePredictionScope,
  parsePredictionTarget,
  PredictionScope,
  PredictionTarget,
} from "../entities/Prediction";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { PredictionService } from "../services/prediction/PredictionService";

const router = Router();
const predictionService = new PredictionService();

router.use((req, res, next) => authenticateToken(req as AuthenticatedRequest, res, next));

router.get("/", async (req: Request, res: Response) => {
  try {
    const scope = typeof req.query.scope === "string"
      ? parsePredictionScope(req.query.scope)
      : undefined;
    const target = typeof req.query.target === "string"
      ? parsePredictionTarget(req.query.target, scope ?? "nexus_business")
      : undefined;

    const predictions = await predictionService.listPredictions({
      scope: scope as PredictionScope | undefined,
      target: target as PredictionTarget | undefined,
    });

    res.json({ predictions });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }

    const scope = parsePredictionScope(req.body.scope);
    const target = parsePredictionTarget(req.body.target, scope);

    const authReq = req as AuthenticatedRequest;

    const prediction = await predictionService.createPrediction({
      title,
      scope,
      target,
      requestedBy: authReq.user?.id ?? null,
      baselineValue: typeof req.body.baselineValue === "number" ? req.body.baselineValue : 0,
      projectedChangePct:
        typeof req.body.projectedChangePct === "number" ? req.body.projectedChangePct : 0,
      horizonPeriods: typeof req.body.horizonPeriods === "number" ? req.body.horizonPeriods : 3,
      periodUnit:
        req.body.periodUnit === "day" ||
        req.body.periodUnit === "week" ||
        req.body.periodUnit === "month" ||
        req.body.periodUnit === "quarter" ||
        req.body.periodUnit === "year"
          ? req.body.periodUnit
          : "month",
      volatilityPct: typeof req.body.volatilityPct === "number" ? req.body.volatilityPct : 10,
      context:
        req.body.context && typeof req.body.context === "object"
          ? req.body.context
          : {},
    });

    res.status(201).json({ prediction });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/accuracy/summary", async (req: Request, res: Response) => {
  try {
    const target = typeof req.query.target === "string" ? req.query.target : undefined;
    const summary = await predictionService.getAccuracySummary(target);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const prediction = await predictionService.getPrediction(req.params.id);
    if (!prediction) {
      res.status(404).json({ error: "Prediction not found" });
      return;
    }

    res.json({ prediction });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/:id/actual", async (req: Request, res: Response) => {
  try {
    if (typeof req.body.actualOutcome !== "number") {
      res.status(400).json({ error: "actualOutcome is required" });
      return;
    }

    const prediction = await predictionService.compareForecastToActual(
      req.params.id,
      req.body.actualOutcome
    );

    if (!prediction) {
      res.status(404).json({ error: "Prediction not found" });
      return;
    }

    res.json({ prediction });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default router;
