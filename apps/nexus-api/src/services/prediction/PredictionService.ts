import { randomUUID } from "crypto";
import { Prediction, PredictionMetric, PredictionRisk, PredictionScope, PredictionTarget } from "../../entities/Prediction";
import { generateCostModel } from "../chef-drew";
import { recordUsage, updatePerformanceScore } from "../capability-discovery/registry";
import { captureSignal } from "../learning";
import { upsertMemoryEntry } from "../memory";
import { buildPlan } from "../planner";
import { analyseRisks, supportDecision } from "../reasoning";
import { ForecastRepository } from "./ForecastRepository";
import { RevenuePredictor } from "./RevenuePredictor";
import { CostPredictor } from "./CostPredictor";
import { GrowthPredictor } from "./GrowthPredictor";
import { DemandPredictor } from "./DemandPredictor";
import { RiskPredictor } from "./RiskPredictor";

export interface PredictorInput {
  baselineValue: number;
  projectedChangePct: number;
  horizonPeriods: number;
  volatilityPct: number;
}

export interface PredictorOutput {
  metric: string;
  value: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  rationale: string;
}

export interface CreatePredictionInput {
  title: string;
  scope: PredictionScope;
  target: PredictionTarget;
  requestedBy: string | null;
  baselineValue: number;
  projectedChangePct: number;
  horizonPeriods: number;
  periodUnit: "day" | "week" | "month" | "quarter" | "year";
  volatilityPct: number;
  context: Record<string, unknown>;
}

export class PredictionService {
  constructor(
    private readonly repository = new ForecastRepository(),
    private readonly revenuePredictor = new RevenuePredictor(),
    private readonly costPredictor = new CostPredictor(),
    private readonly growthPredictor = new GrowthPredictor(),
    private readonly demandPredictor = new DemandPredictor(),
    private readonly riskPredictor = new RiskPredictor()
  ) {}

  async createPrediction(input: CreatePredictionInput): Promise<Prediction> {
    const predictorInput: PredictorInput = {
      baselineValue: input.baselineValue,
      projectedChangePct: input.projectedChangePct,
      horizonPeriods: input.horizonPeriods,
      volatilityPct: input.volatilityPct,
    };

    const predictorResults = [
      this.revenuePredictor.predict(predictorInput),
      this.costPredictor.predict(predictorInput),
      this.growthPredictor.predict(predictorInput),
      this.demandPredictor.predict(predictorInput),
      this.riskPredictor.predict(predictorInput),
    ];

    const metrics: PredictionMetric[] = predictorResults.map((result) => ({
      name: result.metric,
      value: Number(result.value.toFixed(2)),
      lowerBound: Number(result.lowerBound.toFixed(2)),
      upperBound: Number(result.upperBound.toFixed(2)),
      confidence: Number(result.confidence.toFixed(2)),
    }));

    if (input.scope === "chef_drew") {
      try {
        const costModel = await generateCostModel({
          operationName: String(input.context.operationName ?? "Chef Drew Operation"),
          domain: "restaurant",
          coversPerDay: Number(input.context.coversPerDay ?? 100),
          avgSpend: Number(input.context.avgSpend ?? input.baselineValue / 100),
          teamSize: Number(input.context.teamSize ?? 20),
          location: typeof input.context.location === "string" ? input.context.location : undefined,
        });

        metrics.push({
          name: "Prime Cost",
          value: Number(costModel.primeCost.toFixed(2)),
          lowerBound: Number((costModel.primeCost * 0.95).toFixed(2)),
          upperBound: Number((costModel.primeCost * 1.05).toFixed(2)),
          confidence: 74,
        });
      } catch {
        // Preserve deterministic prediction flow if Chef Drew model generation fails.
      }
    }

    const risks = this.buildRisks(metrics);
    const confidence = Number(
      (metrics.reduce((sum, metric) => sum + metric.confidence, 0) / Math.max(metrics.length, 1)).toFixed(2)
    );

    const recommendations = this.buildRecommendations(input, metrics, risks);

    const prediction: Prediction = {
      id: randomUUID(),
      title: input.title,
      scope: input.scope,
      target: input.target,
      requestedBy: input.requestedBy,
      input: {
        baselineValue: input.baselineValue,
        projectedChangePct: input.projectedChangePct,
        horizonPeriods: input.horizonPeriods,
        periodUnit: input.periodUnit,
        volatilityPct: input.volatilityPct,
        context: input.context,
      },
      metrics,
      risks,
      recommendations,
      confidence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actualOutcome: null,
      accuracyScore: null,
    };

    await this.repository.create(prediction);
    await this.integratePredictionSignals(prediction);

    return prediction;
  }

  async listPredictions(filters?: { scope?: PredictionScope; target?: PredictionTarget }): Promise<Prediction[]> {
    return this.repository.list(filters);
  }

  async getPrediction(id: string): Promise<Prediction | null> {
    return this.repository.getById(id);
  }

  async compareForecastToActual(id: string, actualOutcome: number): Promise<Prediction | null> {
    const updated = await this.repository.compareForecastToActual(id, actualOutcome);
    if (!updated) {
      return null;
    }

    const score = updated.accuracyScore ?? 0;

    await captureSignal({
      userId: updated.requestedBy ?? "system",
      entityType: "prediction",
      entityId: updated.id,
      signal: score >= 70 ? "accepted" : "modified",
      context: { target: updated.target, accuracyScore: score, actualOutcome },
    });

    await updatePerformanceScore("financial_modeling", Math.min(100, Math.max(0, Math.round(score))));

    await upsertMemoryEntry({
      sessionId: `prediction-${updated.id}`,
      sourceAgent: "prediction-engine",
      domain: "prediction_accuracy",
      content: `Prediction ${updated.id} for ${updated.target} compared against actual outcome with accuracy score ${score.toFixed(2)}.`,
      tags: ["prediction", "accuracy", updated.target],
      metadata: {
        predictionId: updated.id,
        target: updated.target,
        score,
        actualOutcome,
      },
    });

    return updated;
  }

  async getAccuracySummary(target?: string): Promise<Record<string, number>> {
    return this.repository.getAccuracySummary(target);
  }

  private buildRisks(metrics: PredictionMetric[]): PredictionRisk[] {
    const riskScore = metrics.find((metric) => metric.name === "Risk Score")?.value ?? 50;

    return [
      {
        title: "Forecast variance risk",
        level: riskScore >= 70 ? "high" : riskScore >= 45 ? "medium" : "low",
        probabilityPct: Math.round(Math.min(95, Math.max(5, riskScore))),
        mitigation: "Track weekly deviations and apply rolling re-forecast adjustments.",
      },
      {
        title: "Execution drift risk",
        level: riskScore >= 65 ? "high" : "medium",
        probabilityPct: Math.round(Math.min(90, Math.max(10, riskScore * 0.85))),
        mitigation: "Align planning milestones with accountability owners and KPI checkpoints.",
      },
    ];
  }

  private buildRecommendations(
    input: CreatePredictionInput,
    metrics: PredictionMetric[],
    risks: PredictionRisk[]
  ): string[] {
    const revenue = metrics.find((metric) => metric.name === "Revenue")?.value ?? input.baselineValue;
    const cost = metrics.find((metric) => metric.name === "Cost")?.value ?? input.baselineValue * 0.6;
    const growth = metrics.find((metric) => metric.name === "Growth")?.value ?? 0;
    const highRisk = risks.some((risk) => risk.level === "high");

    const recommendations = [
      `Target ${input.target} using ${input.horizonPeriods} ${input.periodUnit}(s) rolling forecast updates.`,
      revenue > cost
        ? "Projected topline exceeds projected cost profile; prioritize controlled growth execution."
        : "Projected cost profile is elevated; tighten cost controls before scaling.",
      growth >= 0
        ? "Growth trajectory is positive; preserve retention and quality safeguards while scaling."
        : "Growth trajectory is negative; rebalance pricing and demand generation initiatives.",
    ];

    if (highRisk) {
      recommendations.push("Deploy downside scenario triggers and contingency staffing/budget plans.");
    }

    return recommendations;
  }

  private async integratePredictionSignals(prediction: Prediction): Promise<void> {
    await Promise.allSettled([
      captureSignal({
        userId: prediction.requestedBy ?? "system",
        entityType: "prediction",
        entityId: prediction.id,
        signal: "accepted",
        context: { target: prediction.target, scope: prediction.scope, confidence: prediction.confidence },
      }),
      upsertMemoryEntry({
        sessionId: `prediction-${prediction.id}`,
        sourceAgent: "prediction-engine",
        domain: "prediction",
        content: `Created prediction for ${prediction.target} with confidence ${prediction.confidence.toFixed(2)}.`,
        tags: ["prediction", prediction.scope, prediction.target],
        metadata: {
          predictionId: prediction.id,
          target: prediction.target,
          confidence: prediction.confidence,
        },
      }),
      recordUsage("financial_modeling"),
      buildPlan({
        id: prediction.id,
        title: `Forecast ${prediction.target}`,
        description: `Execute and monitor forecast for ${prediction.target}`,
        priority: "medium",
      }),
      analyseRisks({
        domain: "prediction",
        projectId: prediction.id,
        inputs: { target: prediction.target, confidence: prediction.confidence },
      }),
      supportDecision(`How should Nexus execute on forecasted ${prediction.target}?`, {
        domain: "prediction",
        projectId: prediction.id,
        inputs: { recommendations: prediction.recommendations },
      }),
    ]);
  }
}
