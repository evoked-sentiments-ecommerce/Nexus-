export type BrandStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "active"
  | "archived";

export type ColorSwatch = {
  name: string;
  hex: string;
  usage?: string;
};

export type TypographySpec = {
  role: string;
  family: string;
  weight?: string;
};

export type Brand = {
  id: string;
  projectId: string;
  objectiveId: string | null;
  researchItemIds: string[];
  name: string;
  tagline: string;
  mission: string;
  vision: string;
  positioning: string;
  targetAudience: string;
  brandVoice: string;
  personality: string[];
  coreValues: string[];
  colorPalette: ColorSwatch[];
  typography: TypographySpec[];
  status: BrandStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};
