import { Request, Response, Router } from "express";
import {
  parseForecastUnit,
  parsePredictionDomain,
  parsePredictionModel,
  parsePredictionType,
} from "../entities/Prediction";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { PredictionService } from "../services/prediction/PredictionService";

const router = Router();
const predictionService = new PredictionService();

router.use((req, res, next) => authenticateToken(req as AuthenticatedRequest, res, next));

router.get("/", async (req: Request, res: Response) => {
  try {
    const predictionType = typeof req.query.predictionType === "string"
      ? parsePredictionType(req.query.predictionType)
      : undefined;

    const predictions = await predictionService.listPredictions({
      goalId: typeof req.query.goalId === "string" ? req.query.goalId : undefined,
      projectId: typeof req.query.projectId === "string" ? req.query.projectId : undefined,
      predictionType,
    });

    res.json({ predictions });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const predictionType = parsePredictionType(req.body.predictionType ?? req.body.target);
    const domain = parsePredictionDomain(req.body.domain ?? req.body.scope, predictionType);
    const forecastPeriod = {
      periods: typeof req.body.forecastPeriods === "number"
        ? req.body.forecastPeriods
        : typeof req.body.horizonPeriods === "number"
        ? req.body.horizonPeriods
        : 3,
      unit: parseForecastUnit(req.body.forecastUnit ?? req.body.periodUnit),
    };

    const baselineValue = typeof req.body.baselineValue === "number" ? req.body.baselineValue : 0;
    if (!req.body.predictionType && !req.body.target) {
      res.status(400).json({ error: "predictionType is required" });
      return;
    }

    const authReq = req as AuthenticatedRequest;
    const prediction = await predictionService.createPrediction({
      goalId: typeof req.body.goalId === "string" ? req.body.goalId : null,
      projectId: typeof req.body.projectId === "string" ? req.body.projectId : null,
      predictionType,
      predictionModel: parsePredictionModel(req.body.predictionModel, predictionType),
      forecastPeriod,
      inputData: {
        baselineValue,
        projectedChangePct:
          typeof req.body.projectedChangePct === "number" ? req.body.projectedChangePct : 0,
        volatilityPct: typeof req.body.volatilityPct === "number" ? req.body.volatilityPct : 10,
        domain,
        assumptions: Array.isArray(req.body.assumptions)
          ? req.body.assumptions.filter((item: unknown): item is string => typeof item === "string")
          : [],
        drivers:
          req.body.drivers && typeof req.body.drivers === "object"
            ? (Object.fromEntries(
                Object.entries(req.body.drivers).filter(([, value]) => typeof value === "number")
              ) as Record<string, number>)
            : {},
        context:
          req.body.context && typeof req.body.context === "object"
            ? req.body.context
            : {},
      },
      requestedBy: authReq.user?.id ?? null,
    });

    res.status(201).json({ prediction });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/accuracy/summary", async (req: Request, res: Response) => {
  try {
    const predictionType = typeof req.query.predictionType === "string"
      ? req.query.predictionType
      : undefined;
    const summary = await predictionService.summarizeAccuracy(predictionType);
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
    if (!req.body.actualOutcome || typeof req.body.actualOutcome !== "object") {
      res.status(400).json({ error: "actualOutcome is required" });
      return;
    }

    const authReq = req as AuthenticatedRequest;
    const prediction = await predictionService.compareForecastToActual(
      req.params.id,
      req.body.actualOutcome,
      authReq.user?.id ?? null
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
