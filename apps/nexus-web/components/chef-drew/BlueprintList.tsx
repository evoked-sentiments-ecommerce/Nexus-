import BlueprintCard from "./BlueprintCard";
import type { HospitalityBlueprint } from "./types";

type BlueprintListProps = {
  blueprints: HospitalityBlueprint[];
};

export default function BlueprintList({ blueprints }: BlueprintListProps) {
  if (!blueprints.length) {
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
        No blueprints found. Create your first hospitality blueprint to get started.
      </section>
    );
  }

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16,
      }}
    >
      {blueprints.map((blueprint) => (
        <BlueprintCard key={blueprint.id} {...blueprint} />
      ))}
    </section>
  );
}
