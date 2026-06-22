import { QueryResult, query } from "../connection";
import {
  ForecastPeriod,
  Prediction,
  PredictedOutcome,
  PredictionInputData,
  PredictionModel,
  PredictionType,
} from "../../entities/Prediction";

interface PredictionRow {
  id: string;
  goal_id: string | null;
  project_id: string | null;
  prediction_type: PredictionType;
  prediction_model: PredictionModel;
  forecast_period: ForecastPeriod | null;
  input_data: PredictionInputData | null;
  predicted_outcome: PredictedOutcome | null;
  confidence_score: number;
  actual_outcome: Record<string, unknown> | null;
  accuracy_score: number | null;
  created_at: unknown;
  updated_at: unknown;
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function mapRow(row: PredictionRow): Prediction {
  return {
    id: row.id,
    goalId: row.goal_id,
    projectId: row.project_id,
    predictionType: row.prediction_type,
    predictionModel: row.prediction_model,
    forecastPeriod: row.forecast_period ?? { periods: 3, unit: "month" },
    inputData: row.input_data ?? {
      baselineValue: 0,
      projectedChangePct: 0,
      volatilityPct: 0,
      domain: "nexus_business",
      assumptions: [],
      drivers: {},
      context: {},
    },
    predictedOutcome: row.predicted_outcome ?? {
      primaryMetric: row.prediction_type,
      forecastValue: 0,
      forecastChangePct: 0,
      lowerBound: 0,
      upperBound: 0,
      confidenceScore: 0,
      metrics: [],
      risks: [],
      assumptions: [],
      recommendations: [],
      expectedCosts: 0,
      expectedReturns: 0,
      expectedOutcomes: [],
      growthPotential: 0,
    },
    confidenceScore: row.confidence_score,
    actualOutcome: row.actual_outcome,
    accuracyScore: row.accuracy_score,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

type QueryFn = <T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
) => Promise<QueryResult<T>>;

export class PredictionRepository {
  constructor(private readonly queryFn: QueryFn = query) {}

  async list(filter?: {
    goalId?: string;
    projectId?: string;
    predictionType?: PredictionType;
  }): Promise<Prediction[]> {
    const clauses: string[] = [];
    const values: unknown[] = [];

    if (filter?.goalId) {
      values.push(filter.goalId);
      clauses.push(`goal_id = $${values.length}`);
    }

    if (filter?.projectId) {
      values.push(filter.projectId);
      clauses.push(`project_id = $${values.length}`);
    }

    if (filter?.predictionType) {
      values.push(filter.predictionType);
      clauses.push(`prediction_type = $${values.length}`);
    }

    const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const result = await this.queryFn<PredictionRow>(
      `SELECT * FROM predictions ${where} ORDER BY created_at DESC`,
      values
    );

    return result.rows.map(mapRow);
  }

  async getById(id: string): Promise<Prediction | null> {
    const result = await this.queryFn<PredictionRow>(
      "SELECT * FROM predictions WHERE id = $1 LIMIT 1",
      [id]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(prediction: Prediction): Promise<Prediction | null> {
    const result = await this.queryFn<PredictionRow>(
      `INSERT INTO predictions (
         id, goal_id, project_id, prediction_type, prediction_model, forecast_period,
         input_data, predicted_outcome, confidence_score, actual_outcome, accuracy_score
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        prediction.id,
        prediction.goalId,
        prediction.projectId,
        prediction.predictionType,
        prediction.predictionModel,
        prediction.forecastPeriod,
        prediction.inputData,
        prediction.predictedOutcome,
        prediction.confidenceScore,
        prediction.actualOutcome,
        prediction.accuracyScore,
      ]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async updateActualOutcome(
    id: string,
    actualOutcome: Record<string, unknown>,
    accuracyScore: number
  ): Promise<Prediction | null> {
    const result = await this.queryFn<PredictionRow>(
      `UPDATE predictions
       SET actual_outcome = $1, accuracy_score = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [actualOutcome, accuracyScore, id]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }
}
