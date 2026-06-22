"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastRepository = void 0;
class ForecastRepository {
    constructor() {
        this.predictions = new Map();
        this.accuracy = new Map();
    }
    async create(prediction) {
        this.predictions.set(prediction.id, prediction);
        return prediction;
    }
    async list(filters) {
        return Array.from(this.predictions.values()).filter((prediction) => {
            const scopeMatches = !filters?.scope || prediction.scope === filters.scope;
            const targetMatches = !filters?.target || prediction.target === filters.target;
            return scopeMatches && targetMatches;
        });
    }
    async getById(id) {
        return this.predictions.get(id) ?? null;
    }
    async compareForecastToActual(predictionId, actualValue) {
        const prediction = this.predictions.get(predictionId);
        if (!prediction) {
            return null;
        }
        const forecastValue = prediction.metrics[0]?.value ?? 0;
        const denominator = Math.max(Math.abs(actualValue), 1);
        const pctError = Math.abs(forecastValue - actualValue) / denominator;
        const accuracyScore = Math.max(0, Math.min(100, 100 - pctError * 100));
        const updated = {
            ...prediction,
            actualOutcome: actualValue,
            accuracyScore,
            updatedAt: new Date().toISOString(),
        };
        this.predictions.set(predictionId, updated);
        const record = {
            predictionId,
            target: prediction.target,
            forecastValue,
            actualValue,
            accuracyScore,
            comparedAt: new Date().toISOString(),
        };
        const existing = this.accuracy.get(prediction.target) ?? [];
        existing.push(record);
        this.accuracy.set(prediction.target, existing);
        return updated;
    }
    async getAccuracySummary(target) {
        const summary = {};
        for (const [key, records] of this.accuracy.entries()) {
            if (target && key !== target) {
                continue;
            }
            if (records.length === 0) {
                summary[key] = 0;
                continue;
            }
            const avg = records.reduce((sum, record) => sum + record.accuracyScore, 0) / records.length;
            summary[key] = Number(avg.toFixed(2));
        }
        return summary;
    }
}
exports.ForecastRepository = ForecastRepository;
//# sourceMappingURL=ForecastRepository.js.map