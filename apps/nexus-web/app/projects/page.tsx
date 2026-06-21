import Link from "next/link";
import ProjectList from "../../components/projects/ProjectList";
import type { Project } from "../../components/projects/types";

const fallbackProjects: Project[] = [
  {
    id: "prj_foundation",
    title: "Nexus Foundation",
    description: "Initial platform setup and cross-layer architecture baseline.",
    status: "active",
    priority: "high",
    ownerId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function getProjects(): Promise<Project[]> {
  try {
    const apiBaseUrl = process.env.API_URL ?? "http://localhost:3000";
    const response = await fetch(`${apiBaseUrl}/api/projects`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackProjects;
    }

    return (await response.json()) as Project[];
  } catch {
    return fallbackProjects;
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

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
          <h1 style={{ margin: 0, fontSize: 30 }}>Project Dashboard</h1>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>
            Track progress, ownership, and priorities across workspaces.
          </p>
        </div>

        <Link
          href="/projects/new"
          style={{
            textDecoration: "none",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Create Project
        </Link>
      </header>

      <ProjectList projects={projects} />
    </main>
  );
}
