"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionEngine = void 0;
const CostPredictor_1 = require("./CostPredictor");
const DemandPredictor_1 = require("./DemandPredictor");
const ForecastAnalyzer_1 = require("./ForecastAnalyzer");
const GrowthPredictor_1 = require("./GrowthPredictor");
const RevenuePredictor_1 = require("./RevenuePredictor");
const RiskPredictor_1 = require("./RiskPredictor");
class PredictionEngine {
    constructor(revenuePredictor = new RevenuePredictor_1.RevenuePredictor(), costPredictor = new CostPredictor_1.CostPredictor(), growthPredictor = new GrowthPredictor_1.GrowthPredictor(), riskPredictor = new RiskPredictor_1.RiskPredictor(), demandPredictor = new DemandPredictor_1.DemandPredictor(), analyzer = new ForecastAnalyzer_1.ForecastAnalyzer()) {
        this.revenuePredictor = revenuePredictor;
        this.costPredictor = costPredictor;
        this.growthPredictor = growthPredictor;
        this.riskPredictor = riskPredictor;
        this.demandPredictor = demandPredictor;
        this.analyzer = analyzer;
    }
    run(input, predictionModel) {
        const predictorOutputs = [
            this.revenuePredictor.predict(input),
            this.costPredictor.predict(input),
            this.growthPredictor.predict(input),
            this.riskPredictor.predict(input),
            this.demandPredictor.predict(input),
        ];
        const metrics = predictorOutputs.map((output) => ({
            name: output.metric,
            value: Number(output.value.toFixed(2)),
            lowerBound: Number(output.lowerBound.toFixed(2)),
            upperBound: Number(output.upperBound.toFixed(2)),
            confidence: Number(output.confidence.toFixed(2)),
        }));
        const risks = this.analyzer.buildRisks(input.predictionType, metrics, input.inputData.domain);
        const assumptions = this.analyzer.buildAssumptions(input.inputData, predictorOutputs);
        const recommendations = this.analyzer.buildRecommendations(input.predictionType, input.inputData.domain, metrics, risks);
        const primary = this.analyzer.selectPrimaryMetric(input.predictionType, predictionModel, metrics);
        const confidenceScore = this.analyzer.calculateConfidence(metrics);
        const expectedCosts = this.analyzer.estimateExpectedCosts(input.predictionType, metrics);
        const expectedReturns = this.analyzer.estimateExpectedReturns(input.predictionType, metrics, input.inputData.baselineValue);
        const growthPotential = this.analyzer.estimateGrowthPotential(metrics);
        return {
            primaryMetric: primary.name,
            forecastValue: primary.value,
            forecastChangePct: this.analyzer.calculateForecastChange(primary.value, input.inputData.baselineValue),
            lowerBound: primary.lowerBound,
            upperBound: primary.upperBound,
            confidenceScore,
            metrics,
            risks,
            assumptions,
            recommendations,
            expectedCosts,
            expectedReturns,
            expectedOutcomes: this.analyzer.buildExpectedOutcomes(input.predictionType, primary, growthPotential, expectedReturns),
            growthPotential,
        };
    }
}
exports.PredictionEngine = PredictionEngine;
//# sourceMappingURL=PredictionEngine.js.map