import Link from "next/link";
import ResearchList from "../../components/research/ResearchList";
import type { ResearchItem } from "../../components/research/types";

const fallbackItems: ResearchItem[] = [
  {
    id: "res_foundation",
    projectId: "prj_foundation",
    objectiveId: "obj_foundation",
    type: "finding",
    status: "published",
    title: "Cross-Layer Architecture Analysis",
    notes:
      "Initial findings from evaluating the Nexus platform architecture baseline.",
    sources: ["internal architecture review", "platform RFC v1"],
    findings: [
      "Modular entity design supports rapid feature extension.",
      "In-memory stores are suitable for the current development phase.",
    ],
    tags: ["architecture", "foundation", "nexus"],
    attachments: [],
    ownerId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function getResearchItems(): Promise<ResearchItem[]> {
  try {
    const apiBaseUrl = process.env.API_URL ?? "http://localhost:3000";
    const response = await fetch(`${apiBaseUrl}/api/research`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackItems;
    }

    return (await response.json()) as ResearchItem[];
  } catch {
    return fallbackItems;
  }
}

export default async function ResearchPage() {
  const items = await getResearchItems();

  return (
    <main style={{ padding: 24, backgroundColor: "#f1f5f9", minHeight: "100vh" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 30 }}>Research Dashboard</h1>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>
            Manage notes, sources, findings, and attachments across projects.
          </p>
        </div>

        <Link
          href="/research/new"
          style={{
            textDecoration: "none",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Create Research Item
        </Link>
      </header>

      <ResearchList items={items} />
    </main>
  );
}
