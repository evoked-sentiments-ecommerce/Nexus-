import ObjectiveCard from "./ObjectiveCard";
import type { Objective } from "./types";

type ObjectiveListProps = {
  objectives: Objective[];
};

export default function ObjectiveList({ objectives }: ObjectiveListProps) {
  if (!objectives.length) {
    return (
      <section
        style={{
          border: "1px dashed #94a3b8",
          borderRadius: 10,
          padding: 20,
          color: "#475569",
          backgroundColor: "#f8fafc",
        }}
      >
        No objectives found. Create your first objective to get started.
      </section>
    );
  }

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
      }}
    >
      {objectives.map((objective) => (
        <ObjectiveCard key={objective.id} {...objective} />
      ))}
    </section>
  );
}
