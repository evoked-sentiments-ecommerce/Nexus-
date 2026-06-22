export const SIMULATION_CHANGE_TYPES = [
  "Price Changes",
  "Menu Changes",
  "Labor Changes",
  "Inventory Changes",
  "Marketing Changes",
  "Location Changes",
  "Business Model Changes",
  "Operational Changes",
] as const;

export type SimulationChangeType = (typeof SIMULATION_CHANGE_TYPES)[number];

export interface SimulationChange {
  type: SimulationChangeType;
  magnitudePct: number;
  note?: string;
}

export interface SimulationInput {
  baseline: Record<string, number>;
  changes: SimulationChange[];
  horizonPeriods: number;
  periodUnit: "day" | "week" | "month" | "quarter" | "year";
  context: Record<string, unknown>;
}

export interface SimulationImpact {
  name: string;
  value: number;
  direction: "increase" | "decrease" | "neutral";
}

export interface Simulation {
  id: string;
  title: string;
  requestedBy: string | null;
  input: SimulationInput;
  impacts: SimulationImpact[];
  recommendationScore: number;
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}

export function parseSimulationChangeType(value: unknown): SimulationChangeType {
  if (typeof value === "string" && SIMULATION_CHANGE_TYPES.includes(value as SimulationChangeType)) {
    return value as SimulationChangeType;
  }
  return "Operational Changes";
}
