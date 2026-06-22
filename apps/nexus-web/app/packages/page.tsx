import Link from "next/link";
import PackageList from "../../components/packages/PackageList";
import type { Package, PackageStatus, PackageType } from "../../components/packages/types";

type PackagesPageProps = {
  searchParams?: Promise<{
    q?: string;
    type?: string;
    status?: string;
  }>;
};

const fallbackPackages: Package[] = [
  {
    id: "pkg_startup",
    projectId: "prj_foundation",
    objectiveId: "obj_foundation",
    packageName: "Nexus Startup Launch Package",
    packageType: "startup",
    includedDocuments: ["doc_proposal", "doc_business_plan"],
    includedPDFs: ["pdf_proposal", "pdf_business_plan"],
    includedAssets: ["logo_primary", "brand_colors"],
    status: "ready",
    downloadUrl: "/api/packages/pkg_startup/download",
    ownerId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pkg_brand",
    projectId: "prj_brand",
    objectiveId: "obj_brand",
    packageName: "Nexus Brand Identity Package",
    packageType: "brand",
    includedDocuments: ["doc_brand_guide"],
    includedPDFs: ["pdf_brand_guide"],
    includedAssets: ["logo_primary", "logo_secondary", "brand_colors", "typography"],
    status: "assembling",
    downloadUrl: null,
    ownerId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pkg_operations",
    projectId: "prj_ops",
    objectiveId: "obj_ops",
    packageName: "Kitchen Operations Package",
    packageType: "operations",
    includedDocuments: ["doc_sop"],
    includedPDFs: ["pdf_sop"],
    includedAssets: ["workflow_diagram", "checklist_template"],
    status: "ready",
    downloadUrl: "/api/packages/pkg_operations/download",
    ownerId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pkg_training",
    projectId: "prj_training",
    objectiveId: null,
    packageName: "Staff Onboarding Training Package",
    packageType: "training",
    includedDocuments: ["doc_training_manual"],
    includedPDFs: ["pdf_training_manual"],
    includedAssets: ["onboarding_slides", "quiz_template"],
    status: "ready",
    downloadUrl: "/api/packages/pkg_training/download",
    ownerId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pkg_hospitality",
    projectId: "prj_menu",
    objectiveId: null,
    packageName: "Hospitality Blueprint Package",
    packageType: "hospitality_blueprint",
    includedDocuments: ["doc_recipe", "doc_menu"],
    includedPDFs: ["pdf_recipe"],
    includedAssets: ["menu_template", "plating_guide"],
    status: "draft",
    downloadUrl: null,
    ownerId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pkg_executive",
    projectId: "prj_growth",
    objectiveId: "obj_foundation",
    packageName: "Executive Strategy Package",
    packageType: "executive",
    includedDocuments: ["doc_business_plan", "doc_proposal"],
    includedPDFs: ["pdf_business_plan", "pdf_proposal"],
    includedAssets: ["exec_summary", "kpi_dashboard"],
    status: "ready",
    downloadUrl: "/api/packages/pkg_executive/download",
    ownerId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const TYPE_FILTERS: Array<{ label: string; value: "all" | PackageType }> = [
  { label: "All Types", value: "all" },
  { label: "Startup Package", value: "startup" },
  { label: "Brand Package", value: "brand" },
  { label: "Operations Package", value: "operations" },
  { label: "Training Package", value: "training" },
  { label: "Hospitality Blueprint Package", value: "hospitality_blueprint" },
  { label: "Executive Package", value: "executive" },
];

const STATUS_FILTERS: Array<{ label: string; value: "all" | PackageStatus }> = [
  { label: "All Statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Assembling", value: "assembling" },
  { label: "Ready", value: "ready" },
  { label: "Archived", value: "archived" },
];

async function getPackages(): Promise<Package[]> {
  try {
    const apiBaseUrl = process.env.API_URL ?? "http://localhost:3000";
    const response = await fetch(`${apiBaseUrl}/api/packages`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackPackages;
    }

    return (await response.json()) as Package[];
  } catch {
    return fallbackPackages;
  }
}

function filterPackages(
  pkgs: Package[],
  query: string,
  type: string,
  status: string,
): Package[] {
  const q = query.trim().toLowerCase();

  return pkgs.filter((pkg) => {
    const matchesQuery =
      q.length === 0 ||
      pkg.packageName.toLowerCase().includes(q) ||
      pkg.projectId.toLowerCase().includes(q) ||
      (pkg.objectiveId?.toLowerCase().includes(q) ?? false);

    const matchesType = type === "all" || pkg.packageType === type;
    const matchesStatus = status === "all" || pkg.status === status;

    return matchesQuery && matchesType && matchesStatus;
  });
}

export default async function PackagesPage({ searchParams }: PackagesPageProps) {
  const pkgs = await getPackages();
  const params = (await searchParams) ?? {};
  const query = typeof params.q === "string" ? params.q : "";
  const type = typeof params.type === "string" ? params.type : "all";
  const status = typeof params.status === "string" ? params.status : "all";
  const filtered = filterPackages(pkgs, query, type, status);

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
          <h1 style={{ margin: 0, fontSize: 30 }}>Package Dashboard</h1>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>
            Assemble and distribute packages of documents, PDFs, and assets across projects.
          </p>
        </div>

        <Link
          href="/packages/new"
          style={{
            textDecoration: "none",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Create Package
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
          placeholder="Search name, project, or objective"
          style={{
            minWidth: 260,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
          }}
        />
        <select
          name="type"
          defaultValue={type}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
          }}
        >
          {TYPE_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
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

      <PackageList packages={filtered} />
    </main>
  );
}
