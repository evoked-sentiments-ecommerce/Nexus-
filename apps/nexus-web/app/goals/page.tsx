import { GoalList } from "../../components/goals/GoalList";
import { GoalTimeline } from "../../components/goals/GoalTimeline";
import { Goal, GoalMilestone } from "../../components/goals/types";

const demoGoals: Goal[] = [
  {
    id: "goal-demo-1",
    title: "Build a luxury resort",
    description:
      "Design and launch a luxury destination with integrated hospitality systems, training, and operational frameworks.",
    goalType: "Hospitality Goal",
    industry: "Hospitality",
    priority: "high",
    status: "planned",
    targetDate: new Date(Date.now() + 90 * 86400000).toISOString(),
    successCriteria: ["Blueprint approved", "Financial model validated", "Operations launch ready"],
    estimatedImpact: "High strategic and revenue impact",
    estimatedValue: 2500000,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const demoMilestones: GoalMilestone[] = [
  {
    id: "m1",
    title: "Research and concept validation complete",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    status: "pending",
  },
  {
    id: "m2",
    title: "Hospitality blueprint and menu engineering complete",
    dueDate: new Date(Date.now() + 45 * 86400000).toISOString(),
    status: "pending",
  },
  {
    id: "m3",
    title: "Training systems and operational framework complete",
    dueDate: new Date(Date.now() + 75 * 86400000).toISOString(),
    status: "pending",
  },
];

export default function GoalsPage(): string {
  return [
    "Nexus Goal Engine",
    "=================",
    "",
    GoalList({ goals: demoGoals }),
    "",
    "Timeline",
    "--------",
    GoalTimeline({ milestones: demoMilestones }),
  ].join("\n");
}
