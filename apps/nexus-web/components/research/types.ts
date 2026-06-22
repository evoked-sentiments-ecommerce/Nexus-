export type ResearchItemType =
  | "project"
  | "note"
  | "source"
  | "finding"
  | "attachment";

export type ResearchItemStatus =
  | "draft"
  | "in_review"
  | "published"
  | "archived";

export type ResearchItem = {
  id: string;
  projectId: string;
  objectiveId: string | null;
  type: ResearchItemType;
  status: ResearchItemStatus;
  title: string;
  notes: string;
  sources: string[];
  findings: string[];
  tags: string[];
  attachments: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};
