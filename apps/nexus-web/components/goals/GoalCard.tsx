import { Goal, formatGoalPriority, formatGoalStatus } from "./types";

export interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps): string {
  return [
    `Goal: ${goal.title}`,
    `Type: ${goal.goalType}`,
    `Priority: ${formatGoalPriority(goal.priority)}`,
    `Status: ${formatGoalStatus(goal.status)}`,
    `Description: ${goal.description}`,
    goal.targetDate ? `Target Date: ${new Date(goal.targetDate).toLocaleDateString()}` : "Target Date: Not set",
  ].join("\n");
}
