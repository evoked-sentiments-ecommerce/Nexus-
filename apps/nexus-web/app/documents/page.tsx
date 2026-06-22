import Link from "next/link";
import DocumentList from "../../components/documents/DocumentList";
import type { Document, DocumentStatus } from "../../components/documents/types";

type DocumentsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

const fallbackDocuments: Document[] = [
  {
    id: "doc_foundation",
    projectId: "prj_foundation",
    objectiveId: "obj_foundation",
    brandId: "brd_foundation",
    title: "Nexus Brand Strategy Proposal",
    documentType: "proposal",
    content:
      "This proposal outlines the foundational brand strategy for Nexus, including positioning, voice, target audience, and a phased activation roadmap.",
    status: "draft",
    version: 1,
    tags: ["brand", "strategy", "proposal"],
    ownerId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "doc_plan",
    projectId: "prj_foundation",
    objectiveId: "obj_foundation",
    brandId: "brd_foundation",
    title: "Go-to-Market Marketing Plan",
    documentType: "marketing_plan",
    content:
      "Comprehensive GTM plan covering messaging, channels, launch milestones, and campaign KPIs for the Nexus rollout.",
    status: "published",
    version: 3,
    tags: ["marketing", "gtm", "launch"],
    ownerId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const STATUS_FILTERS: Array<{ label: string; value: "all" | DocumentStatus }> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

async function getDocuments(): Promise<Document[]> {
  try {
    const apiBaseUrl = process.env.API_URL ?? "http://localhost:3000";
    const response = await fetch(`${apiBaseUrl}/api/documents`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackDocuments;
    }

    return (await response.json()) as Document[];
  } catch {
    return fallbackDocuments;
  }
}

function filterDocuments(documents: Document[], query: string, status: string): Document[] {
  const q = query.trim().toLowerCase();

  return documents.filter((document) => {
    const matchesQuery =
      q.length === 0 ||
      document.title.toLowerCase().includes(q) ||
      document.content.toLowerCase().includes(q) ||
      document.tags.some((tag) => tag.toLowerCase().includes(q));

    const matchesStatus = status === "all" || document.status === status;

    return matchesQuery && matchesStatus;
  });
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const documents = await getDocuments();
  const params = (await searchParams) ?? {};
  const query = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const filteredDocuments = filterDocuments(documents, query, status);

  return (
    <main style={{ padding: 24, backgroundColor: "#f1f5f9", minHeight: "100vh" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 30 }}>Document Dashboard</h1>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>
            Manage versioned documents across projects, objectives, and brands.
          </p>
        </div>

        <Link
          href="/documents/new"
          style={{
            textDecoration: "none",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Create Document
        </Link>
      </header>

      <form
        method="GET"
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search title, content, tags"
          style={{
            minWidth: 260,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
          }}
        />
        <select
          name="status"
          defaultValue={status}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
          }}
        >
          {STATUS_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #0f172a",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            fontWeight: 600,
          }}
        >
          Filter
        </button>
      </form>

      <DocumentList documents={filteredDocuments} />
    </main>
  );
}
