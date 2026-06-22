// ---------------------------------------------------------------------------
// Learning Service — captures user feedback, acceptance/rejection signals,
// and generates improvement insights for the Nexus Intelligence Core.
// ---------------------------------------------------------------------------

import { logInfo } from "../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FeedbackSentiment = "positive" | "neutral" | "negative";
export type SignalType = "accepted" | "rejected" | "modified" | "ignored";

export interface UserFeedback {
  feedbackId: string;
  userId: string;
  entityType: string;
  entityId: string;
  sentiment: FeedbackSentiment;
  rating?: number;       // 1-5 star rating
  comment?: string;
  tags?: string[];
  capturedAt: string;
}

export interface AcceptanceSignal {
  signalId: string;
  userId: string;
  entityType: string;
  entityId: string;
  signal: SignalType;
  context?: Record<string, unknown>;
  capturedAt: string;
}

export interface ImprovementInsight {
  insightId: string;
  title: string;
  description: string;
  category: "ux" | "content" | "performance" | "feature" | "process";
  evidenceSummary: string;
  signalCount: number;
  impactScore: number;   // 0-100
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// In-process stores (stub — replace with DB persistence)
// ---------------------------------------------------------------------------

const feedbackStore: UserFeedback[] = [];
const signalStore: AcceptanceSignal[] = [];

// ---------------------------------------------------------------------------
// Feedback capture
// ---------------------------------------------------------------------------

/**
 * Record a piece of user feedback on any platform entity.
 */
export async function captureFeedback(
  input: Omit<UserFeedback, "feedbackId" | "capturedAt">
): Promise<UserFeedback> {
  const record: UserFeedback = {
    ...input,
    feedbackId: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    capturedAt: new Date().toISOString(),
  };

  feedbackStore.push(record);

  logInfo("learning_feedback_captured", {
    feedbackId: record.feedbackId,
    userId: record.userId,
    entityType: record.entityType,
    sentiment: record.sentiment,
  });

  return record;
}

/**
 * Retrieve all feedback for a given entity.
 */
export async function getFeedbackForEntity(
  entityType: string,
  entityId: string
): Promise<UserFeedback[]> {
  return feedbackStore.filter(
    (f) => f.entityType === entityType && f.entityId === entityId
  );
}

// ---------------------------------------------------------------------------
// Acceptance / rejection signal capture
// ---------------------------------------------------------------------------

/**
 * Record an acceptance or rejection signal from a user interaction.
 * Signals indicate whether the platform's suggestions or generated content
 * were accepted, rejected, modified, or ignored.
 */
export async function captureSignal(
  input: Omit<AcceptanceSignal, "signalId" | "capturedAt">
): Promise<AcceptanceSignal> {
  const record: AcceptanceSignal = {
    ...input,
    signalId: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    capturedAt: new Date().toISOString(),
  };

  signalStore.push(record);

  logInfo("learning_signal_captured", {
    signalId: record.signalId,
    userId: record.userId,
    entityType: record.entityType,
    signal: record.signal,
  });

  return record;
}

/**
 * Retrieve all signals for a given entity.
 */
export async function getSignalsForEntity(
  entityType: string,
  entityId: string
): Promise<AcceptanceSignal[]> {
  return signalStore.filter(
    (s) => s.entityType === entityType && s.entityId === entityId
  );
}

// ---------------------------------------------------------------------------
// Improvement insight generation
// ---------------------------------------------------------------------------

/**
 * Analyse accumulated feedback and signals to produce actionable improvement
 * insights.
 *
 * Replace the stub body with an LLM call or statistical analysis engine that
 * clusters signals and generates structured recommendations.
 */
export async function generateInsights(
  entityType?: string
): Promise<ImprovementInsight[]> {
  const relevantFeedback = entityType
    ? feedbackStore.filter((f) => f.entityType === entityType)
    : feedbackStore;

  const relevantSignals = entityType
    ? signalStore.filter((s) => s.entityType === entityType)
    : signalStore;

  const totalSignals = relevantFeedback.length + relevantSignals.length;

  logInfo("learning_insights_generated", {
    entityType: entityType ?? "all",
    feedbackCount: relevantFeedback.length,
    signalCount: relevantSignals.length,
  });

  if (totalSignals === 0) {
    return [];
  }

  // Stub — replace with LLM-driven insight synthesis.
  const negativeCount = relevantFeedback.filter((f) => f.sentiment === "negative").length;
  const rejectionCount = relevantSignals.filter((s) => s.signal === "rejected").length;

  const insights: ImprovementInsight[] = [];

  if (negativeCount > 0) {
    insights.push({
      insightId: `insight-${Date.now()}-1`,
      title: "Recurring negative feedback detected",
      description: `${negativeCount} negative feedback item(s) recorded${entityType ? ` for ${entityType}` : ""}. Review for common themes.`,
      category: "ux",
      evidenceSummary: `${negativeCount} negative feedback entries`,
      signalCount: negativeCount,
      impactScore: Math.min(negativeCount * 15, 100),
      generatedAt: new Date().toISOString(),
    });
  }

  if (rejectionCount > 0) {
    insights.push({
      insightId: `insight-${Date.now()}-2`,
      title: "High suggestion rejection rate",
      description: `${rejectionCount} rejection(s) recorded. Generated content or suggestions may need refinement.`,
      category: "content",
      evidenceSummary: `${rejectionCount} rejection signal(s)`,
      signalCount: rejectionCount,
      impactScore: Math.min(rejectionCount * 20, 100),
      generatedAt: new Date().toISOString(),
    });
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Summary stats
// ---------------------------------------------------------------------------

export interface LearningSummary {
  totalFeedback: number;
  sentimentBreakdown: Record<FeedbackSentiment, number>;
  totalSignals: number;
  signalBreakdown: Record<SignalType, number>;
}

/**
 * Return a high-level summary of all captured learning data.
 */
export async function getLearningSummary(): Promise<LearningSummary> {
  const sentimentBreakdown: Record<FeedbackSentiment, number> = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };
  for (const f of feedbackStore) sentimentBreakdown[f.sentiment]++;

  const signalBreakdown: Record<SignalType, number> = {
    accepted: 0,
    rejected: 0,
    modified: 0,
    ignored: 0,
  };
  for (const s of signalStore) signalBreakdown[s.signal]++;

  return {
    totalFeedback: feedbackStore.length,
    sentimentBreakdown,
    totalSignals: signalStore.length,
    signalBreakdown,
  };
}
