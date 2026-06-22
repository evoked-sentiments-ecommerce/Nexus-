"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIMULATION_CHANGE_TYPES = void 0;
exports.parseSimulationChangeType = parseSimulationChangeType;
exports.SIMULATION_CHANGE_TYPES = [
    "Price Changes",
    "Menu Changes",
    "Labor Changes",
    "Inventory Changes",
    "Marketing Changes",
    "Location Changes",
    "Business Model Changes",
    "Operational Changes",
];
function parseSimulationChangeType(value) {
    if (typeof value === "string" && exports.SIMULATION_CHANGE_TYPES.includes(value)) {
        return value;
    }
    return "Operational Changes";
}
//# sourceMappingURL=Simulation.js.map