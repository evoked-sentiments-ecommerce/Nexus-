"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionService = void 0;
const crypto_1 = require("crypto");
const env_1 = require("../../config/env");
const PredictionRepository_1 = require("../../database/repositories/PredictionRepository");
const registry_1 = require("../capability-discovery/registry");
const learning_1 = require("../learning");
const memory_1 = require("../memory");
const planner_1 = require("../planner");
const reasoning_1 = require("../reasoning");
const ForecastAnalyzer_1 = require("./ForecastAnalyzer");
const PredictionEngine_1 = require("./PredictionEngine");
class PredictionService {
    constructor(repository = new PredictionRepository_1.PredictionRepository(), predictionEngine = new PredictionEngine_1.PredictionEngine(), analyzer = new ForecastAnalyzer_1.ForecastAnalyzer()) {
        this.repository = repository;
        this.predictionEngine = predictionEngine;
        this.analyzer = analyzer;
        this.memoryPredictions = new Map();
    }
    async createPrediction(input) {
        const predictedOutcome = this.predictionEngine.run({
            predictionType: input.predictionType,
            forecastPeriods: input.forecastPeriod.periods,
            inputData: input.inputData,
        }, input.predictionModel);
        const prediction = {
            id: (0, crypto_1.randomUUID)(),
            goalId: input.goalId,
            projectId: input.projectId,
            predictionType: input.predictionType,
            predictionModel: input.predictionModel,
            forecastPeriod: input.forecastPeriod,
            inputData: input.inputData,
            predictedOutcome,
            confidenceScore: predictedOutcome.confidenceScore,
            actualOutcome: null,
            accuracyScore: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const stored = env_1.env.DATABASE_URL ? await this.repository.create(prediction) : null;
        const result = stored ?? prediction;
        if (!stored && !env_1.env.DATABASE_URL) {
            this.memoryPredictions.set(result.id, result);
        }
        await this.integratePredictionSignals(result, input.requestedBy);
        return result;
    }
    async listPredictions(filters) {
        if (env_1.env.DATABASE_URL) {
            return this.repository.list(filters);
        }
        return Array.from(this.memoryPredictions.values()).filter((prediction) => {
            return (!filters?.goalId || prediction.goalId === filters.goalId)
                && (!filters?.projectId || prediction.projectId === filters.projectId)
                && (!filters?.predictionType || prediction.predictionType === filters.predictionType);
        });
    }
    async getPrediction(id) {
        if (env_1.env.DATABASE_URL) {
            return this.repository.getById(id);
        }
        return this.memoryPredictions.get(id) ?? null;
    }
    async compareForecastToActual(id, actualOutcome, requestedBy) {
        const existing = await this.getPrediction(id);
        if (!existing) {
            return null;
        }
        const actualValue = typeof actualOutcome.actualValue === "number"
            ? actualOutcome.actualValue
            : typeof actualOutcome.forecastValue === "number"
                ? actualOutcome.forecastValue
                : existing.predictedOutcome.forecastValue;
        const accuracyScore = this.analyzer.calculateAccuracyScore(existing.predictedOutcome.forecastValue, actualValue);
        const updated = {
            ...existing,
            actualOutcome,
            accuracyScore,
            updatedAt: new Date().toISOString(),
        };
        const persisted = env_1.env.DATABASE_URL
            ? await this.repository.updateActualOutcome(updated.id, actualOutcome, accuracyScore)
            : null;
        const result = persisted ?? updated;
        if (!persisted && !env_1.env.DATABASE_URL) {
            this.memoryPredictions.set(result.id, result);
        }
        await this.integrateLearning(result, actualValue, requestedBy);
        return result;
    }
    async getAccuracySummary(predictionType) {
        return this.summarizeAccuracy(predictionType);
    }
    async summarizeAccuracy(predictionType) {
        const predictions = await this.listPredictions(predictionType ? { predictionType: predictionType } : undefined);
        const grouped = predictions.reduce((acc, prediction) => {
            if (prediction.accuracyScore == null) {
                return acc;
            }
            acc[prediction.predictionType] = acc[prediction.predictionType] ?? [];
            acc[prediction.predictionType].push(prediction.accuracyScore);
            return acc;
        }, {});
        return Object.fromEntries(Object.entries(grouped).map(([key, scores]) => [
            key,
            Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)),
        ]));
    }
    async integratePredictionSignals(prediction, requestedBy) {
        await Promise.allSettled([
            (0, learning_1.captureSignal)({
                userId: requestedBy ?? "system",
                entityType: "prediction",
                entityId: prediction.id,
                signal: "accepted",
                context: {
                    predictionType: prediction.predictionType,
                    confidenceScore: prediction.confidenceScore,
                    goalId: prediction.goalId,
                    projectId: prediction.projectId,
                },
            }),
            (0, memory_1.upsertMemoryEntry)({
                sessionId: `prediction-${prediction.id}`,
                sourceAgent: "prediction-engine",
                domain: "prediction_forecast",
                content: `Forecast stored for ${prediction.predictionType} with confidence ${prediction.confidenceScore.toFixed(2)}.`,
                tags: ["forecast", prediction.predictionType, prediction.inputData.domain],
                metadata: {
                    predictionId: prediction.id,
                    goalId: prediction.goalId,
                    projectId: prediction.projectId,
                    assumptions: prediction.predictedOutcome.assumptions,
                    predictedOutcome: prediction.predictedOutcome,
                },
            }),
            (0, planner_1.buildPlan)({
                id: prediction.id,
                title: `Forecast ${prediction.predictionType}`,
                description: `Execute against forecast for ${prediction.predictionType}`,
                priority: prediction.confidenceScore >= 75 ? "high" : "medium",
            }),
            (0, reasoning_1.analyseRisks)({
                domain: "prediction",
                projectId: prediction.projectId ?? prediction.id,
                inputs: {
                    predictionType: prediction.predictionType,
                    risks: prediction.predictedOutcome.risks,
                    confidenceScore: prediction.confidenceScore,
                },
            }),
            (0, reasoning_1.supportDecision)(`How should Nexus execute the ${prediction.predictionType} forecast?`, {
                domain: "prediction",
                projectId: prediction.projectId ?? prediction.id,
                inputs: {
                    recommendations: prediction.predictedOutcome.recommendations,
                    expectedReturns: prediction.predictedOutcome.expectedReturns,
                    expectedCosts: prediction.predictedOutcome.expectedCosts,
                },
            }),
            (0, registry_1.recordUsage)("financial_modeling"),
        ]);
    }
    async integrateLearning(prediction, actualValue, requestedBy) {
        const accuracyScore = prediction.accuracyScore ?? 0;
        const insights = await (0, learning_1.generateInsights)("prediction");
        const modelImprovements = [
            accuracyScore >= 85
                ? "Current model assumptions are performing well; preserve the weighting profile."
                : "Model variance is elevated; tighten drivers and shorten review intervals.",
            ...insights.map((insight) => insight.description),
        ];
        await Promise.allSettled([
            (0, learning_1.captureSignal)({
                userId: requestedBy ?? "system",
                entityType: "prediction",
                entityId: prediction.id,
                signal: accuracyScore >= 70 ? "accepted" : "modified",
                context: {
                    predictionType: prediction.predictionType,
                    actualValue,
                    accuracyScore,
                },
            }),
            (0, registry_1.updatePerformanceScore)("financial_modeling", Math.round(Math.max(0, Math.min(100, accuracyScore)))),
            (0, memory_1.upsertMemoryEntry)({
                sessionId: `prediction-${prediction.id}`,
                sourceAgent: "prediction-engine",
                domain: "prediction_learning",
                content: `Prediction outcome recorded for ${prediction.predictionType} with accuracy ${accuracyScore.toFixed(2)}.`,
                tags: ["prediction", "outcome", prediction.predictionType],
                metadata: {
                    predictionId: prediction.id,
                    actualOutcome: prediction.actualOutcome,
                    accuracyScore,
                    modelImprovements,
                    learningEvents: [
                        "Predicted result compared to actual result",
                        "Accuracy score generated",
                        "Model improvement notes captured",
                    ],
                },
            }),
        ]);
    }
}
exports.PredictionService = PredictionService;
//# sourceMappingURL=PredictionService.js.map