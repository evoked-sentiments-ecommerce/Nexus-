import { randomUUID } from "node:crypto";
import { type PDFTemplateType } from "../entities/PDFTemplate";
import { uploadFile } from "./storageService";

export type GeneratePDFInput = {
  projectId: string;
  documentId: string;
  title: string;
  templateType: PDFTemplateType;
};

export type GeneratedPDFAsset = {
  key: string;
  fileName: string;
  downloadUrl: string;
  size: number;
};

const TEMPLATE_LABELS: Record<PDFTemplateType, string> = {
  proposal: "Proposal",
  business_plan: "Business Plan",
  brand_guide: "Brand Guide",
  sop: "SOP",
  training_manual: "Training Manual",
  recipe: "Recipe",
};

const TEMPLATE_SECTIONS: Record<PDFTemplateType, string[]> = {
  proposal: [
    "Executive Summary",
    "Project Scope",
    "Deliverables",
    "Timeline",
    "Investment",
  ],
  business_plan: [
    "Business Overview",
    "Market Analysis",
    "Operations Plan",
    "Financial Strategy",
    "Growth Milestones",
  ],
  brand_guide: [
    "Brand Mission",
    "Voice and Tone",
    "Logo Usage",
    "Color Palette",
    "Typography and Visual Assets",
  ],
  sop: [
    "Purpose",
    "Roles and Responsibilities",
    "Standard Process Steps",
    "Quality Controls",
    "Revision History",
  ],
  training_manual: [
    "Learning Objectives",
    "Module Breakdown",
    "Hands-on Exercises",
    "Evaluation Criteria",
    "Completion Checklist",
  ],
  recipe: [
    "Ingredients",
    "Preparation",
    "Cooking Steps",
    "Serving Notes",
    "Storage Guidance",
  ],
};

const escapePdfText = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const trimBoundaryDashes = (value: string): string => {
  let start = 0;
  let end = value.length;

  while (start < end && value[start] === "-") {
    start += 1;
  }

  while (end > start && value[end - 1] === "-") {
    end -= 1;
  }

  return value.slice(start, end);
};

const toSlug = (value: string): string =>
  trimBoundaryDashes(value.toLowerCase().replace(/[^a-z0-9]+/g, "-")).slice(0, 80) ||
  "document";

const wrapText = (text: string, maxLength = 78): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = words[0];

  for (const word of words.slice(1)) {
    if (`${current} ${word}`.length <= maxLength) {
      current = `${current} ${word}`;
      continue;
    }

    lines.push(current);
    current = word;
  }

  lines.push(current);
  return lines;
};

const buildContentLines = (input: GeneratePDFInput): string[] => {
  const now = new Date().toISOString();
  const templateLabel = TEMPLATE_LABELS[input.templateType];
  const sections = TEMPLATE_SECTIONS[input.templateType];

  const intro = `${templateLabel} generated for project ${input.projectId} and document ${input.documentId}.`;
  const sectionLines = sections.flatMap((section, index) =>
    wrapText(`${index + 1}. ${section}`).map((line) => `• ${line}`),
  );

  return [
    input.title,
    templateLabel,
    "",
    ...wrapText(intro),
    "",
    "Recommended Sections",
    ...sectionLines,
    "",
    `Generated at: ${now}`,
    "Powered by Nexus",
  ].slice(0, 36);
};

const buildPdfBuffer = (lines: string[]): Buffer => {
  const textCommands: string[] = ["BT", "/F1 12 Tf", "72 740 Td"];

  lines.forEach((line, index) => {
    const escaped = escapePdfText(line);
    if (index === 0) {
      textCommands.push(`(${escaped}) Tj`);
      return;
    }

    textCommands.push("0 -18 Td");
    textCommands.push(`(${escaped}) Tj`);
  });

  textCommands.push("ET");

  const streamContent = `${textCommands.join("\n")}\n`;
  const objects: string[] = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${Buffer.byteLength(streamContent, "utf8")} >>\nstream\n${streamContent}endstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let body = "";
  const offsets: number[] = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(`%PDF-1.4\n${body}`, "utf8"));
    body += object;
  }

  const xrefStart = Buffer.byteLength(`%PDF-1.4\n${body}`, "utf8");
  const xrefRows = offsets
    .map((offset, index) =>
      index === 0
        ? "0000000000 65535 f "
        : `${offset.toString().padStart(10, "0")} 00000 n `,
    )
    .join("\n");

  const xref = `xref\n0 ${offsets.length}\n${xrefRows}\n`;
  const trailer = `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(`%PDF-1.4\n${body}${xref}${trailer}`, "utf8");
};

export const generateAndStorePDF = async (
  input: GeneratePDFInput,
): Promise<GeneratedPDFAsset> => {
  const safeTitle = input.title.trim() || TEMPLATE_LABELS[input.templateType];
  const fileName = `${toSlug(safeTitle)}.pdf`;
  const key = `pdf/${input.templateType}/${input.documentId}-${randomUUID()}.pdf`;

  const lines = buildContentLines({ ...input, title: safeTitle });
  const pdfData = buildPdfBuffer(lines);

  const uploaded = await uploadFile({
    key,
    fileName,
    data: pdfData,
    contentType: "application/pdf",
  });

  return {
    key: uploaded.key,
    fileName: uploaded.fileName,
    downloadUrl: uploaded.url,
    size: uploaded.size,
  };
};
