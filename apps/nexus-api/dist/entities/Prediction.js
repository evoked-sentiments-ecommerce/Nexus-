"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHEF_DREW_PREDICTION_TARGETS = exports.NEXUS_BUSINESS_PREDICTION_TARGETS = void 0;
exports.parsePredictionScope = parsePredictionScope;
exports.parsePredictionTarget = parsePredictionTarget;
exports.NEXUS_BUSINESS_PREDICTION_TARGETS = [
    "Revenue",
    "Profitability",
    "Cash Flow",
    "Customer Growth",
    "Marketing Performance",
    "Hiring Needs",
    "Operational Efficiency",
    "Project Success Probability",
    "Business Risk",
    "Market Opportunity",
];
exports.CHEF_DREW_PREDICTION_TARGETS = [
    "Food Cost",
    "Labor Cost",
    "Prime Cost",
    "Menu Performance",
    "Inventory Demand",
    "Purchasing Demand",
    "Waste Levels",
    "Guest Demand",
    "Staffing Demand",
    "Training Impact",
    "Revenue Per Cover",
    "Forecast Accuracy",
];
function parsePredictionScope(value) {
    if (value === "chef_drew") {
        return "chef_drew";
    }
    return "nexus_business";
}
function parsePredictionTarget(value, scope) {
    if (typeof value !== "string") {
        return scope === "chef_drew" ? "Prime Cost" : "Revenue";
    }
    if (exports.NEXUS_BUSINESS_PREDICTION_TARGETS.includes(value)) {
        return value;
    }
    if (exports.CHEF_DREW_PREDICTION_TARGETS.includes(value)) {
        return value;
    }
    return scope === "chef_drew" ? "Prime Cost" : "Revenue";
}
//# sourceMappingURL=Prediction.js.map