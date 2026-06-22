export type BrandStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "active"
  | "archived";

export interface ColorSwatch {
  name: string;
  hex: string;
  usage?: string;
}

export interface TypographySpec {
  role: string;
  family: string;
  weight?: string;
}

export interface Brand {
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
}

export interface CreateBrandInput {
  projectId: string;
  objectiveId?: string | null;
  researchItemIds?: string[];
  name: string;
  tagline?: string;
  mission?: string;
  vision?: string;
  positioning?: string;
  targetAudience?: string;
  brandVoice?: string;
  personality?: string[];
  coreValues?: string[];
  colorPalette?: ColorSwatch[];
  typography?: TypographySpec[];
  status?: BrandStatus;
  ownerId: string;
}

export interface UpdateBrandInput {
  name?: string;
  tagline?: string;
  mission?: string;
  vision?: string;
  positioning?: string;
  targetAudience?: string;
  brandVoice?: string;
  personality?: string[];
  coreValues?: string[];
  colorPalette?: ColorSwatch[];
  typography?: TypographySpec[];
  status?: BrandStatus;
  researchItemIds?: string[];
}
