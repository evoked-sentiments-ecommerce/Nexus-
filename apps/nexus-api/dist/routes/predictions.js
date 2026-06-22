"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Prediction_1 = require("../entities/Prediction");
const auth_1 = require("../middleware/auth");
const PredictionService_1 = require("../services/prediction/PredictionService");
const router = (0, express_1.Router)();
const predictionService = new PredictionService_1.PredictionService();
router.use((req, res, next) => (0, auth_1.authenticateToken)(req, res, next));
router.get("/", async (req, res) => {
    try {
        const predictionType = typeof req.query.predictionType === "string"
            ? (0, Prediction_1.parsePredictionType)(req.query.predictionType)
            : undefined;
        const predictions = await predictionService.listPredictions({
            goalId: typeof req.query.goalId === "string" ? req.query.goalId : undefined,
            projectId: typeof req.query.projectId === "string" ? req.query.projectId : undefined,
            predictionType,
        });
        res.json({ predictions });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/", async (req, res) => {
    try {
        const predictionType = (0, Prediction_1.parsePredictionType)(req.body.predictionType ?? req.body.target);
        const domain = (0, Prediction_1.parsePredictionDomain)(req.body.domain ?? req.body.scope, predictionType);
        const forecastPeriod = {
            periods: typeof req.body.forecastPeriods === "number"
                ? req.body.forecastPeriods
                : typeof req.body.horizonPeriods === "number"
                    ? req.body.horizonPeriods
                    : 3,
            unit: (0, Prediction_1.parseForecastUnit)(req.body.forecastUnit ?? req.body.periodUnit),
        };
        const baselineValue = typeof req.body.baselineValue === "number" ? req.body.baselineValue : 0;
        if (!req.body.predictionType && !req.body.target) {
            res.status(400).json({ error: "predictionType is required" });
            return;
        }
        const authReq = req;
        const prediction = await predictionService.createPrediction({
            goalId: typeof req.body.goalId === "string" ? req.body.goalId : null,
            projectId: typeof req.body.projectId === "string" ? req.body.projectId : null,
            predictionType,
            predictionModel: (0, Prediction_1.parsePredictionModel)(req.body.predictionModel, predictionType),
            forecastPeriod,
            inputData: {
                baselineValue,
                projectedChangePct: typeof req.body.projectedChangePct === "number" ? req.body.projectedChangePct : 0,
                volatilityPct: typeof req.body.volatilityPct === "number" ? req.body.volatilityPct : 10,
                domain,
                assumptions: Array.isArray(req.body.assumptions)
                    ? req.body.assumptions.filter((item) => typeof item === "string")
                    : [],
                drivers: req.body.drivers && typeof req.body.drivers === "object"
                    ? Object.fromEntries(Object.entries(req.body.drivers).filter(([, value]) => typeof value === "number"))
                    : {},
                context: req.body.context && typeof req.body.context === "object"
                    ? req.body.context
                    : {},
            },
            requestedBy: authReq.user?.id ?? null,
        });
        res.status(201).json({ prediction });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.get("/accuracy/summary", async (req, res) => {
    try {
        const predictionType = typeof req.query.predictionType === "string"
            ? req.query.predictionType
            : undefined;
        const summary = await predictionService.summarizeAccuracy(predictionType);
        res.json({ summary });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const prediction = await predictionService.getPrediction(req.params.id);
        if (!prediction) {
            res.status(404).json({ error: "Prediction not found" });
            return;
        }
        res.json({ prediction });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/:id/actual", async (req, res) => {
    try {
        if (!req.body.actualOutcome || typeof req.body.actualOutcome !== "object") {
            res.status(400).json({ error: "actualOutcome is required" });
            return;
        }
        const authReq = req;
        const prediction = await predictionService.compareForecastToActual(req.params.id, req.body.actualOutcome, authReq.user?.id ?? null);
        if (!prediction) {
            res.status(404).json({ error: "Prediction not found" });
            return;
        }
        res.json({ prediction });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
exports.default = router;
//# sourceMappingURL=predictions.js.map