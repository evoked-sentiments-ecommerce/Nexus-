import Link from "next/link";
import ObjectiveList from "../../components/objectives/ObjectiveList";
import type { Objective } from "../../components/objectives/types";

const fallbackObjectives: Objective[] = [
  {
    id: "obj_foundation",
    projectId: "prj_foundation",
    title: "Establish Core Architecture",
    description:
      "Define and validate the foundational cross-layer architecture for the Nexus platform.",
    status: "in_progress",
    progress: 60,
    targetDate: null,
    ownerId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function getObjectives(): Promise<Objective[]> {
  try {
    const apiBaseUrl = process.env.API_URL ?? "http://localhost:3000";
    const response = await fetch(`${apiBaseUrl}/api/objectives`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackObjectives;
    }

    return (await response.json()) as Objective[];
  } catch {
    return fallbackObjectives;
  }
}

export default async function ObjectivesPage() {
  const objectives = await getObjectives();

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
          <h1 style={{ margin: 0, fontSize: 30 }}>Objective Dashboard</h1>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>
            Track progress, ownership, and targets across projects.
          </p>
        </div>

        <Link
          href="/objectives/new"
          style={{
            textDecoration: "none",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Create Objective
        </Link>
      </header>

      <ObjectiveList objectives={objectives} />
    </main>
  );
}
