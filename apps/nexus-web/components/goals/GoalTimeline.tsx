import { GoalMilestone } from "./types";

export interface GoalTimelineProps {
  milestones: GoalMilestone[];
}

export function GoalTimeline({ milestones }: GoalTimelineProps): string {
  if (milestones.length === 0) {
    return "No milestones generated.";
  }

  return milestones
    .slice()
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .map(
      (milestone) =>
        `${new Date(milestone.dueDate).toLocaleDateString()} · ${milestone.title} (${milestone.status})`
    )
    .join("\n");
}
