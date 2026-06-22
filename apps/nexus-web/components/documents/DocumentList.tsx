import DocumentCard from "./DocumentCard";
import type { Document } from "./types";

type DocumentListProps = {
  documents: Document[];
};

export default function DocumentList({ documents }: DocumentListProps) {
  if (!documents.length) {
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
        No documents found. Create your first document to get started.
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
      {documents.map((document) => (
        <DocumentCard key={document.id} {...document} />
      ))}
    </section>
  );
}
