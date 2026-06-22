import ResearchCard from "./ResearchCard";
import type { ResearchItem } from "./types";

type ResearchListProps = {
  items: ResearchItem[];
};

export default function ResearchList({ items }: ResearchListProps) {
  if (!items.length) {
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
        No research items found. Create your first research item to get started.
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
      {items.map((item) => (
        <ResearchCard key={item.id} {...item} />
      ))}
    </section>
  );
}
