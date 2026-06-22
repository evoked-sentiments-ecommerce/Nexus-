import Link from "next/link";
import BrandList from "../../components/brands/BrandList";
import type { Brand } from "../../components/brands/types";

const fallbackBrands: Brand[] = [
  {
    id: "brd_foundation",
    projectId: "prj_foundation",
    objectiveId: "obj_foundation",
    researchItemIds: ["res_foundation"],
    name: "Nexus",
    tagline: "Connect. Create. Command.",
    mission:
      "Empower teams to build, research, and ship ideas at the speed of thought.",
    vision:
      "A world where every team has a unified platform to turn strategy into reality.",
    positioning:
      "The all-in-one workspace for product, brand, and research teams.",
    targetAudience:
      "Product managers, brand strategists, and research leads at growth-stage companies.",
    brandVoice:
      "Clear, confident, and empowering — we speak like a trusted advisor.",
    personality: ["Innovative", "Trustworthy", "Bold", "Empowering"],
    coreValues: ["Clarity", "Velocity", "Collaboration", "Integrity"],
    colorPalette: [
      { name: "Midnight", hex: "#0f172a", usage: "Primary" },
      { name: "Slate", hex: "#475569", usage: "Secondary" },
      { name: "Violet", hex: "#7c3aed", usage: "Accent" },
      { name: "Sky", hex: "#e0f2fe", usage: "Background" },
    ],
    typography: [
      { role: "Heading", family: "Inter", weight: "700" },
      { role: "Body", family: "Inter", weight: "400" },
      { role: "Mono", family: "JetBrains Mono", weight: "400" },
    ],
    status: "active",
    ownerId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function getBrands(): Promise<Brand[]> {
  try {
    const apiBaseUrl = process.env.API_URL ?? "http://localhost:3000";
    const response = await fetch(`${apiBaseUrl}/api/brands`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackBrands;
    }

    return (await response.json()) as Brand[];
  } catch {
    return fallbackBrands;
  }
}

export default async function BrandsPage() {
  const brands = await getBrands();

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
          <h1 style={{ margin: 0, fontSize: 30 }}>Brand Dashboard</h1>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>
            Manage brand strategy, identity, and positioning across projects.
          </p>
        </div>

        <Link
          href="/brands/new"
          style={{
            textDecoration: "none",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Create Brand
        </Link>
      </header>

      <BrandList brands={brands} />
    </main>
  );
}
