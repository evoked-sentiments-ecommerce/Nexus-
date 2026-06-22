import Link from "next/link";
import PDFTemplateList from "../../components/pdf/PDFTemplateList";
import type { PDFTemplate, PDFTemplateType } from "../../components/pdf/types";

type PDFPageProps = {
  searchParams?: Promise<{
    q?: string;
    template?: string;
  }>;
};

const fallbackTemplates: PDFTemplate[] = [
  {
    id: "pdf_proposal",
    projectId: "prj_foundation",
    documentId: "doc_proposal",
    title: "Nexus Client Proposal PDF",
    templateType: "proposal",
    status: "generated",
    previewUrl: "/api/pdf/pdf_proposal/preview",
    downloadUrl: "/api/pdf/pdf_proposal/download",
    exportControls: ["include_cover_page", "include_branding", "include_toc"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pdf_business_plan",
    projectId: "prj_growth",
    documentId: "doc_business_plan",
    title: "FY26 Business Plan PDF",
    templateType: "business_plan",
    status: "generated",
    previewUrl: "/api/pdf/pdf_business_plan/preview",
    downloadUrl: "/api/pdf/pdf_business_plan/download",
    exportControls: ["include_cover_page", "include_toc", "optimize_for_print"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pdf_brand_guide",
    projectId: "prj_brand",
    documentId: "doc_brand_guide",
    title: "Brand Guide PDF",
    templateType: "brand_guide",
    status: "pending",
    previewUrl: null,
    downloadUrl: null,
    exportControls: ["include_branding", "enable_watermark"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pdf_sop",
    projectId: "prj_ops",
    documentId: "doc_sop",
    title: "Kitchen SOP PDF",
    templateType: "sop",
    status: "generated",
    previewUrl: "/api/pdf/pdf_sop/preview",
    downloadUrl: "/api/pdf/pdf_sop/download",
    exportControls: ["include_toc", "optimize_for_print"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pdf_training_manual",
    projectId: "prj_training",
    documentId: "doc_training_manual",
    title: "Onboarding Training Manual PDF",
    templateType: "training_manual",
    status: "generated",
    previewUrl: "/api/pdf/pdf_training_manual/preview",
    downloadUrl: "/api/pdf/pdf_training_manual/download",
    exportControls: ["include_cover_page", "include_toc", "enable_watermark"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pdf_recipe",
    projectId: "prj_menu",
    documentId: "doc_recipe",
    title: "Seasonal Recipe PDF",
    templateType: "recipe",
    status: "failed",
    previewUrl: null,
    downloadUrl: null,
    exportControls: ["optimize_for_print", "include_branding"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const TEMPLATE_FILTERS: Array<{ label: string; value: "all" | PDFTemplateType }> = [
  { label: "All Templates", value: "all" },
  { label: "Proposal", value: "proposal" },
  { label: "Business Plan", value: "business_plan" },
  { label: "Brand Guide", value: "brand_guide" },
  { label: "SOP", value: "sop" },
  { label: "Training Manual", value: "training_manual" },
  { label: "Recipe", value: "recipe" },
];

async function getPDFTemplates(): Promise<PDFTemplate[]> {
  try {
    const apiBaseUrl = process.env.API_URL ?? "http://localhost:3000";
    const response = await fetch(`${apiBaseUrl}/api/pdf`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackTemplates;
    }

    return (await response.json()) as PDFTemplate[];
  } catch {
    return fallbackTemplates;
  }
}

function filterTemplates(templates: PDFTemplate[], query: string, template: string): PDFTemplate[] {
  const q = query.trim().toLowerCase();

  return templates.filter((item) => {
    const matchesQuery =
      q.length === 0 ||
      item.title.toLowerCase().includes(q) ||
      item.projectId.toLowerCase().includes(q) ||
      item.documentId.toLowerCase().includes(q);

    const matchesTemplate = template === "all" || item.templateType === template;

    return matchesQuery && matchesTemplate;
  });
}

export default async function PDFPage({ searchParams }: PDFPageProps) {
  const templates = await getPDFTemplates();
  const params = (await searchParams) ?? {};
  const query = typeof params.q === "string" ? params.q : "";
  const template = typeof params.template === "string" ? params.template : "all";
  const filteredTemplates = filterTemplates(templates, query, template);

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
          <h1 style={{ margin: 0, fontSize: 30 }}>PDF Engine</h1>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>
            Generate PDFs from documents with template selection, preview, and export controls.
          </p>
        </div>

        <Link
          href="/documents"
          style={{
            textDecoration: "none",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Select Source Document
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
          placeholder="Search title, project, or document"
          style={{
            minWidth: 260,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
          }}
        />
        <select
          name="template"
          defaultValue={template}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
          }}
        >
          {TEMPLATE_FILTERS.map((item) => (
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

      <PDFTemplateList templates={filteredTemplates} />
    </main>
  );
}
