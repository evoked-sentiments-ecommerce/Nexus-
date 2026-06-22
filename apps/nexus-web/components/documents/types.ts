export type DocumentType =
  | "proposal"
  | "business_plan"
  | "strategy"
  | "sop"
  | "training_manual"
  | "marketing_plan"
  | "brand_guide"
  | "recipe"
  | "report"
  | "contract";

export type DocumentStatus = "draft" | "published" | "archived";

export type Document = {
  id: string;
  projectId: string;
  objectiveId: string | null;
  brandId: string | null;
  title: string;
  documentType: DocumentType;
  content: string;
  status: DocumentStatus;
  version: number;
  tags: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};
