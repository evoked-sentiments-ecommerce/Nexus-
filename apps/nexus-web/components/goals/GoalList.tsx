import { Goal } from "./types";
import { GoalCard } from "./GoalCard";

export interface GoalListProps {
  goals: Goal[];
}

export function GoalList({ goals }: GoalListProps): string {
  if (goals.length === 0) {
    return "No goals yet.";
  }

  return goals.map((goal) => GoalCard({ goal })).join("\n\n----------------\n\n");
}
