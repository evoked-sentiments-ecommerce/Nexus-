"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHEF_DREW_PREDICTION_TYPES = exports.NEXUS_PREDICTION_TYPES = void 0;
exports.parsePredictionDomain = parsePredictionDomain;
exports.parsePredictionType = parsePredictionType;
exports.parsePredictionModel = parsePredictionModel;
exports.parseForecastUnit = parseForecastUnit;
exports.NEXUS_PREDICTION_TYPES = [
    "Revenue",
    "Profitability",
    "Cash Flow",
    "Customer Acquisition",
    "Customer Retention",
    "Marketing Performance",
    "Hiring Demand",
    "Operational Efficiency",
    "Project Success Probability",
    "Growth Potential",
    "Risk Exposure",
];
exports.CHEF_DREW_PREDICTION_TYPES = [
    "Food Cost",
    "Labor Cost",
    "Prime Cost",
    "Inventory Demand",
    "Vendor Demand",
    "Menu Performance",
    "Guest Demand",
    "Revenue Per Cover",
    "Training Impact",
    "Operational Efficiency",
    "Waste Levels",
];
function parsePredictionDomain(value, predictionType) {
    if (value === "chef_drew" || (typeof predictionType === "string" && exports.CHEF_DREW_PREDICTION_TYPES.includes(predictionType))) {
        return "chef_drew";
    }
    return "nexus_business";
}
function parsePredictionType(value, domain) {
    if (typeof value === "string") {
        if (exports.NEXUS_PREDICTION_TYPES.includes(value)) {
            return value;
        }
        if (exports.CHEF_DREW_PREDICTION_TYPES.includes(value)) {
            return value;
        }
    }
    return domain === "chef_drew" ? "Prime Cost" : "Revenue";
}
function parsePredictionModel(value, predictionType) {
    if (value === "prediction_engine" ||
        value === "revenue_predictor" ||
        value === "cost_predictor" ||
        value === "growth_predictor" ||
        value === "risk_predictor" ||
        value === "demand_predictor") {
        return value;
    }
    if (predictionType.includes("Revenue"))
        return "revenue_predictor";
    if (predictionType.includes("Cost") || predictionType === "Waste Levels")
        return "cost_predictor";
    if (predictionType === "Customer Acquisition" ||
        predictionType === "Customer Retention" ||
        predictionType === "Growth Potential" ||
        predictionType === "Hiring Demand" ||
        predictionType === "Training Impact") {
        return "growth_predictor";
    }
    if (predictionType === "Inventory Demand" ||
        predictionType === "Vendor Demand" ||
        predictionType === "Guest Demand") {
        return "demand_predictor";
    }
    if (predictionType === "Risk Exposure" ||
        predictionType === "Project Success Probability") {
        return "risk_predictor";
    }
    return "prediction_engine";
}
function parseForecastUnit(value) {
    if (value === "day" ||
        value === "week" ||
        value === "month" ||
        value === "quarter" ||
        value === "year") {
        return value;
    }
    return "month";
}
//# sourceMappingURL=Prediction.js.map