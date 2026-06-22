export type FeedbackSentiment = "positive" | "neutral" | "negative";
export type SignalType = "accepted" | "rejected" | "modified" | "ignored";
export interface UserFeedback {
    feedbackId: string;
    userId: string;
    entityType: string;
    entityId: string;
    sentiment: FeedbackSentiment;
    rating?: number;
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
    impactScore: number;
    generatedAt: string;
}
/**
 * Record a piece of user feedback on any platform entity.
 */
export declare function captureFeedback(input: Omit<UserFeedback, "feedbackId" | "capturedAt">): Promise<UserFeedback>;
/**
 * Retrieve all feedback for a given entity.
 */
export declare function getFeedbackForEntity(entityType: string, entityId: string): Promise<UserFeedback[]>;
/**
 * Record an acceptance or rejection signal from a user interaction.
 * Signals indicate whether the platform's suggestions or generated content
 * were accepted, rejected, modified, or ignored.
 */
export declare function captureSignal(input: Omit<AcceptanceSignal, "signalId" | "capturedAt">): Promise<AcceptanceSignal>;
/**
 * Retrieve all signals for a given entity.
 */
export declare function getSignalsForEntity(entityType: string, entityId: string): Promise<AcceptanceSignal[]>;
/**
 * Analyse accumulated feedback and signals to produce actionable improvement
 * insights.
 *
 * Replace the stub body with an LLM call or statistical analysis engine that
 * clusters signals and generates structured recommendations.
 */
export declare function generateInsights(entityType?: string): Promise<ImprovementInsight[]>;
export interface LearningSummary {
    totalFeedback: number;
    sentimentBreakdown: Record<FeedbackSentiment, number>;
    totalSignals: number;
    signalBreakdown: Record<SignalType, number>;
}
/**
 * Return a high-level summary of all captured learning data.
 */
export declare function getLearningSummary(): Promise<LearningSummary>;
//# sourceMappingURL=index.d.ts.map