"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOAL_TYPES = void 0;
exports.parseGoalType = parseGoalType;
exports.GOAL_TYPES = [
    "Business Goal",
    "Hospitality Goal",
    "Technology Goal",
    "Marketing Goal",
    "Financial Goal",
    "HR Goal",
    "Operations Goal",
    "Research Goal",
    "Custom Goal",
];
function parseGoalType(value) {
    if (typeof value === "string" && exports.GOAL_TYPES.includes(value)) {
        return value;
    }
    return "Custom Goal";
}
//# sourceMappingURL=Goal.js.map