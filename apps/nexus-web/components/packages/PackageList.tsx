import PackageCard from "./PackageCard";
import type { Package } from "./types";

type PackageListProps = {
  packages: Package[];
};

export default function PackageList({ packages }: PackageListProps) {
  if (!packages.length) {
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
        No packages found. Create your first package to get started.
      </section>
    );
  }

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 16,
      }}
    >
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} {...pkg} />
      ))}
    </section>
  );
}
