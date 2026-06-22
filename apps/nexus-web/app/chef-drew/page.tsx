import Link from "next/link";
import BlueprintList from "../../components/chef-drew/BlueprintList";
import type { HospitalityBlueprint } from "../../components/chef-drew/types";

const fallbackBlueprints: HospitalityBlueprint[] = [
  {
    id: "bp_foundation",
    projectId: "prj_foundation",
    objectiveId: null,
    researchItemIds: [],
    brandIds: [],
    documentIds: [],
    pdfTemplateIds: [],
    title: "Nexus Restaurant Blueprint",
    description:
      "Full-stack restaurant concept blueprint covering menu engineering, food cost targets, labor models, and hospitality operations framework.",
    blueprintType: "restaurant",
    features: [
      "concept_development",
      "menu_engineering",
      "food_cost_models",
      "labor_models",
      "sop_generation",
      "revenue_strategy",
    ],
    conceptNotes: "Modern farm-to-table concept with seasonal menus.",
    menuEngineering:
      "Three-tier menu structure optimised for contribution margin.",
    foodCostTarget: 28,
    laborCostTarget: 32,
    revenueStrategy: "Covers + beverage attach rate + private dining revenue.",
    operationsFramework: "SOPs aligned to Forbes five-star service standards.",
    status: "active",
    ownerId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function getBlueprints(): Promise<HospitalityBlueprint[]> {
  try {
    const apiBaseUrl = process.env.API_URL ?? "http://localhost:3000";
    const response = await fetch(`${apiBaseUrl}/api/chef-drew`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackBlueprints;
    }

    return (await response.json()) as HospitalityBlueprint[];
  } catch {
    return fallbackBlueprints;
  }
}

export default async function ChefDrewPage() {
  const blueprints = await getBlueprints();

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
          <h1 style={{ margin: 0, fontSize: 30 }}>Chef Drew Engine</h1>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>
            Hospitality blueprints for restaurant, hotel F&amp;B, resort,
            private club, catering, and executive advisory engagements.
          </p>
        </div>

        <Link
          href="/chef-drew/new"
          style={{
            textDecoration: "none",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Create Blueprint
        </Link>
      </header>

      <BlueprintList blueprints={blueprints} />
    </main>
  );
}
