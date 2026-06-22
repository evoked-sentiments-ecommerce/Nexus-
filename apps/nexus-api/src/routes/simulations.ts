import { Request, Response, Router } from "express";
import { parseSimulationChangeType } from "../entities/Simulation";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { SimulationService } from "../services/simulation/SimulationService";

const router = Router();
const simulationService = new SimulationService();

router.use((req, res, next) => authenticateToken(req as AuthenticatedRequest, res, next));

router.get("/", async (_req: Request, res: Response) => {
  try {
    const simulations = await simulationService.listSimulations();
    res.json({ simulations });
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

    const authReq = req as AuthenticatedRequest;

    const baseline =
      req.body.baseline && typeof req.body.baseline === "object"
        ? Object.fromEntries(
            Object.entries(req.body.baseline).map(([key, value]) => [
              key,
              typeof value === "number" ? value : Number(value) || 0,
            ])
          )
        : {};

    const changes = Array.isArray(req.body.changes)
      ? req.body.changes.map((change: unknown) => {
          const value = change as { type?: unknown; magnitudePct?: unknown; note?: unknown };
          return {
            type: parseSimulationChangeType(value.type),
            magnitudePct:
              typeof value.magnitudePct === "number" ? value.magnitudePct : Number(value.magnitudePct) || 0,
            note: typeof value.note === "string" ? value.note : undefined,
          };
        })
      : [];

    const simulation = await simulationService.createSimulation({
      title,
      requestedBy: authReq.user?.id ?? null,
      baseline,
      changes,
      horizonPeriods: typeof req.body.horizonPeriods === "number" ? req.body.horizonPeriods : 3,
      periodUnit:
        req.body.periodUnit === "day" ||
        req.body.periodUnit === "week" ||
        req.body.periodUnit === "month" ||
        req.body.periodUnit === "quarter" ||
        req.body.periodUnit === "year"
          ? req.body.periodUnit
          : "month",
      context:
        req.body.context && typeof req.body.context === "object"
          ? req.body.context
          : {},
    });

    res.status(201).json({ simulation });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const simulation = await simulationService.getSimulation(req.params.id);
    if (!simulation) {
      res.status(404).json({ error: "Simulation not found" });
      return;
    }

    res.json({ simulation });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default router;
