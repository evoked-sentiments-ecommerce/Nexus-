import BrandCard from "./BrandCard";
import type { Brand } from "./types";

type BrandListProps = {
  brands: Brand[];
};

export default function BrandList({ brands }: BrandListProps) {
  if (!brands.length) {
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
        No brands found. Create your first brand to get started.
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
      {brands.map((brand) => (
        <BrandCard key={brand.id} {...brand} />
      ))}
    </section>
  );
}
