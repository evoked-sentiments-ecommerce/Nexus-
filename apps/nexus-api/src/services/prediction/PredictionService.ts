import { randomUUID } from "crypto";
import { env } from "../../config/env";
import {
  Prediction,
  PredictionInputData,
  PredictionModel,
  PredictionType,
} from "../../entities/Prediction";
import { PredictionRepository } from "../../database/repositories/PredictionRepository";
import { recordUsage, updatePerformanceScore } from "../capability-discovery/registry";
import { captureSignal, generateInsights } from "../learning";
import { upsertMemoryEntry } from "../memory";
import { buildPlan } from "../planner";
import { analyseRisks, supportDecision } from "../reasoning";
import { ForecastAnalyzer } from "./ForecastAnalyzer";
import { PredictionEngine } from "./PredictionEngine";

export interface CreatePredictionInput {
  goalId: string | null;
  projectId: string | null;
  predictionType: PredictionType;
  predictionModel: PredictionModel;
  forecastPeriod: Prediction["forecastPeriod"];
  inputData: PredictionInputData;
  requestedBy: string | null;
}

export class PredictionService {
  private readonly memoryPredictions = new Map<string, Prediction>();

  constructor(
    private readonly repository = new PredictionRepository(),
    private readonly predictionEngine = new PredictionEngine(),
    private readonly analyzer = new ForecastAnalyzer()
  ) {}

  async createPrediction(input: CreatePredictionInput): Promise<Prediction> {
    const predictedOutcome = this.predictionEngine.run(
      {
        predictionType: input.predictionType,
        forecastPeriods: input.forecastPeriod.periods,
        inputData: input.inputData,
      },
      input.predictionModel
    );

    const prediction: Prediction = {
      id: randomUUID(),
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

    const stored = env.DATABASE_URL ? await this.repository.create(prediction) : null;
    const result = stored ?? prediction;

    if (!stored && !env.DATABASE_URL) {
      this.memoryPredictions.set(result.id, result);
    }

    await this.integratePredictionSignals(result, input.requestedBy);
    return result;
  }

  async listPredictions(filters?: {
    goalId?: string;
    projectId?: string;
    predictionType?: PredictionType;
  }): Promise<Prediction[]> {
    if (env.DATABASE_URL) {
      return this.repository.list(filters);
    }

    return Array.from(this.memoryPredictions.values()).filter((prediction) => {
      return (!filters?.goalId || prediction.goalId === filters.goalId)
        && (!filters?.projectId || prediction.projectId === filters.projectId)
        && (!filters?.predictionType || prediction.predictionType === filters.predictionType);
    });
  }

  async getPrediction(id: string): Promise<Prediction | null> {
    if (env.DATABASE_URL) {
      return this.repository.getById(id);
    }

    return this.memoryPredictions.get(id) ?? null;
  }

  async compareForecastToActual(
    id: string,
    actualOutcome: Record<string, unknown>,
    requestedBy: string | null
  ): Promise<Prediction | null> {
    const existing = await this.getPrediction(id);
    if (!existing) {
      return null;
    }

    const actualValue = typeof actualOutcome.actualValue === "number"
      ? actualOutcome.actualValue
      : typeof actualOutcome.forecastValue === "number"
      ? actualOutcome.forecastValue
      : existing.predictedOutcome.forecastValue;

    const accuracyScore = this.analyzer.calculateAccuracyScore(
      existing.predictedOutcome.forecastValue,
      actualValue
    );

    const updated: Prediction = {
      ...existing,
      actualOutcome,
      accuracyScore,
      updatedAt: new Date().toISOString(),
    };

    const persisted = env.DATABASE_URL
      ? await this.repository.updateActualOutcome(updated.id, actualOutcome, accuracyScore)
      : null;
    const result = persisted ?? updated;

    if (!persisted && !env.DATABASE_URL) {
      this.memoryPredictions.set(result.id, result);
    }

    await this.integrateLearning(result, actualValue, requestedBy);
    return result;
  }

  async getAccuracySummary(predictionType?: string): Promise<Record<string, number>> {
    return this.summarizeAccuracy(predictionType);
  }

  async summarizeAccuracy(predictionType?: string): Promise<Record<string, number>> {
    const predictions = await this.listPredictions(
      predictionType ? { predictionType: predictionType as PredictionType } : undefined
    );

    const grouped = predictions.reduce<Record<string, number[]>>((acc, prediction) => {
      if (prediction.accuracyScore == null) {
        return acc;
      }

      acc[prediction.predictionType] = acc[prediction.predictionType] ?? [];
      acc[prediction.predictionType].push(prediction.accuracyScore);
      return acc;
    }, {});

    return Object.fromEntries(
      Object.entries(grouped).map(([key, scores]) => [
        key,
        Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)),
      ])
    );
  }

  private async integratePredictionSignals(prediction: Prediction, requestedBy: string | null): Promise<void> {
    await Promise.allSettled([
      captureSignal({
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
      upsertMemoryEntry({
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
      buildPlan({
        id: prediction.id,
        title: `Forecast ${prediction.predictionType}`,
        description: `Execute against forecast for ${prediction.predictionType}`,
        priority: prediction.confidenceScore >= 75 ? "high" : "medium",
      }),
      analyseRisks({
        domain: "prediction",
        projectId: prediction.projectId ?? prediction.id,
        inputs: {
          predictionType: prediction.predictionType,
          risks: prediction.predictedOutcome.risks,
          confidenceScore: prediction.confidenceScore,
        },
      }),
      supportDecision(`How should Nexus execute the ${prediction.predictionType} forecast?`, {
        domain: "prediction",
        projectId: prediction.projectId ?? prediction.id,
        inputs: {
          recommendations: prediction.predictedOutcome.recommendations,
          expectedReturns: prediction.predictedOutcome.expectedReturns,
          expectedCosts: prediction.predictedOutcome.expectedCosts,
        },
      }),
      recordUsage("financial_modeling"),
    ]);
  }

  private async integrateLearning(
    prediction: Prediction,
    actualValue: number,
    requestedBy: string | null
  ): Promise<void> {
    const accuracyScore = prediction.accuracyScore ?? 0;
    const insights = await generateInsights("prediction");
    const modelImprovements = [
      accuracyScore >= 85
        ? "Current model assumptions are performing well; preserve the weighting profile."
        : "Model variance is elevated; tighten drivers and shorten review intervals.",
      ...insights.map((insight) => insight.description),
    ];

    await Promise.allSettled([
      captureSignal({
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
      updatePerformanceScore("financial_modeling", Math.round(Math.max(0, Math.min(100, accuracyScore)))),
      upsertMemoryEntry({
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
