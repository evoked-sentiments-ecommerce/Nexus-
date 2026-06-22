import PDFTemplateCard from "./PDFTemplateCard";
import type { PDFTemplate } from "./types";

type PDFTemplateListProps = {
  templates: PDFTemplate[];
};

export default function PDFTemplateList({ templates }: PDFTemplateListProps) {
  if (!templates.length) {
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
        No PDF templates found. Select a template and generate your first PDF.
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
      {templates.map((template) => (
        <PDFTemplateCard key={template.id} {...template} />
      ))}
    </section>
  );
}
