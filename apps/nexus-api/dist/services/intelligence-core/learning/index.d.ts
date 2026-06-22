export type SignalType = "accepted" | "rejected" | "modified" | "ignored" | "escalated";
export type FeedbackSentiment = "positive" | "neutral" | "negative";
export type OutcomeStatus = "success" | "partial" | "failure";
export interface LearningSignal {
    signalId: string;
    userId: string;
    entityType: string;
    entityId: string;
    signalType: SignalType;
    context?: Record<string, unknown>;
    capturedAt: string;
}
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
export interface OutcomeRecord {
    outcomeId: string;
    objectiveId: string;
    status: OutcomeStatus;
    measuredValues: Record<string, number>;
    qualitativeNotes: string[];
    recordedAt: string;
}
export interface LearningInsight {
    insightId: string;
    title: string;
    description: string;
    category: "ux" | "content" | "performance" | "feature" | "process" | "strategy";
    evidenceSummary: string;
    impactScore: number;
    confidence: "high" | "medium" | "low";
    generatedAt: string;
}
export declare function captureSignal(input: Omit<LearningSignal, "signalId" | "capturedAt">): Promise<LearningSignal>;
export declare function captureFeedback(input: Omit<UserFeedback, "feedbackId" | "capturedAt">): Promise<UserFeedback>;
export declare function recordOutcome(input: Omit<OutcomeRecord, "outcomeId" | "recordedAt">): Promise<OutcomeRecord>;
export declare function generateInsights(entityType?: string): Promise<LearningInsight[]>;
export declare function getLearningSummary(): Promise<{
    totalSignals: number;
    totalFeedback: number;
    totalOutcomes: number;
    signalBreakdown: Record<string, number>;
    sentimentBreakdown: Record<string, number>;
    outcomeBreakdown: Record<string, number>;
}>;
//# sourceMappingURL=index.d.ts.map