"use strict";
// ---------------------------------------------------------------------------
// Learning Service — captures user feedback, acceptance/rejection signals,
// and generates improvement insights for the Nexus Intelligence Core.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureFeedback = captureFeedback;
exports.getFeedbackForEntity = getFeedbackForEntity;
exports.captureSignal = captureSignal;
exports.getSignalsForEntity = getSignalsForEntity;
exports.generateInsights = generateInsights;
exports.getLearningSummary = getLearningSummary;
const logger_1 = require("../logger");
// ---------------------------------------------------------------------------
// In-process stores (stub — replace with DB persistence)
// ---------------------------------------------------------------------------
const feedbackStore = [];
const signalStore = [];
// ---------------------------------------------------------------------------
// Feedback capture
// ---------------------------------------------------------------------------
/**
 * Record a piece of user feedback on any platform entity.
 */
async function captureFeedback(input) {
    const record = {
        ...input,
        feedbackId: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        capturedAt: new Date().toISOString(),
    };
    feedbackStore.push(record);
    (0, logger_1.logInfo)("learning_feedback_captured", {
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
async function getFeedbackForEntity(entityType, entityId) {
    return feedbackStore.filter((f) => f.entityType === entityType && f.entityId === entityId);
}
// ---------------------------------------------------------------------------
// Acceptance / rejection signal capture
// ---------------------------------------------------------------------------
/**
 * Record an acceptance or rejection signal from a user interaction.
 * Signals indicate whether the platform's suggestions or generated content
 * were accepted, rejected, modified, or ignored.
 */
async function captureSignal(input) {
    const record = {
        ...input,
        signalId: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        capturedAt: new Date().toISOString(),
    };
    signalStore.push(record);
    (0, logger_1.logInfo)("learning_signal_captured", {
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
async function getSignalsForEntity(entityType, entityId) {
    return signalStore.filter((s) => s.entityType === entityType && s.entityId === entityId);
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
async function generateInsights(entityType) {
    const relevantFeedback = entityType
        ? feedbackStore.filter((f) => f.entityType === entityType)
        : feedbackStore;
    const relevantSignals = entityType
        ? signalStore.filter((s) => s.entityType === entityType)
        : signalStore;
    const totalSignals = relevantFeedback.length + relevantSignals.length;
    (0, logger_1.logInfo)("learning_insights_generated", {
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
    const insights = [];
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
/**
 * Return a high-level summary of all captured learning data.
 */
async function getLearningSummary() {
    const sentimentBreakdown = {
        positive: 0,
        neutral: 0,
        negative: 0,
    };
    for (const f of feedbackStore)
        sentimentBreakdown[f.sentiment]++;
    const signalBreakdown = {
        accepted: 0,
        rejected: 0,
        modified: 0,
        ignored: 0,
    };
    for (const s of signalStore)
        signalBreakdown[s.signal]++;
    return {
        totalFeedback: feedbackStore.length,
        sentimentBreakdown,
        totalSignals: signalStore.length,
        signalBreakdown,
    };
}
//# sourceMappingURL=index.js.map