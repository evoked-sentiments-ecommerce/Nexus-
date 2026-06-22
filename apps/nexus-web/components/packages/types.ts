export type PackageType =
  | "startup"
  | "brand"
  | "operations"
  | "training"
  | "hospitality_blueprint"
  | "executive";

export type PackageStatus = "draft" | "assembling" | "ready" | "archived";

export type Package = {
  id: string;
  projectId: string;
  objectiveId: string | null;
  packageName: string;
  packageType: PackageType;
  includedDocuments: string[];
  includedPDFs: string[];
  includedAssets: string[];
  status: PackageStatus;
  downloadUrl: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};
