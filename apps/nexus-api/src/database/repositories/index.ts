import { query, QueryResult } from "../connection";

export type QueryFn = <T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
) => Promise<QueryResult<T>>;

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  ownerId: string | null;
  name: string;
  description: string | null;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Objective {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  orchestrationStatus: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchFindingRecord {
  id: string;
  projectId: string | null;
  objectiveId: string | null;
  domain: string;
  topic: string;
  summary: string;
  details: string;
  sources: string[];
  confidence: string;
  relevanceScore: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BrandRecord {
  id: string;
  projectId: string | null;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontPrimary: string;
  fontSecondary: string;
  logoUrl: string | null;
  tagline: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  projectId: string | null;
  objectiveId: string | null;
  brandId: string | null;
  title: string;
  type: string;
  status: string;
  content: string;
  storageKey: string | null;
  storageUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PackageRecord {
  id: string;
  projectId: string | null;
  objectiveId: string | null;
  documentId: string | null;
  name: string;
  type: string;
  status: string;
  manifestUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EvolutionProposalRecord {
  id: string;
  projectId: string | null;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  analysisPeriod: string;
  evidence: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  role: string;
  status: string;
  created_at: unknown;
  updated_at: unknown;
}

interface ProjectRow {
  id: string;
  owner_id: string | null;
  name: string;
  description: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: unknown;
  updated_at: unknown;
}

interface ObjectiveRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: unknown;
  orchestration_status: string;
  metadata: Record<string, unknown> | null;
  created_at: unknown;
  updated_at: unknown;
}

interface ResearchFindingRow {
  id: string;
  project_id: string | null;
  objective_id: string | null;
  domain: string;
  topic: string;
  summary: string;
  details: string;
  sources: string[] | null;
  confidence: string;
  relevance_score: number;
  metadata: Record<string, unknown> | null;
  created_at: unknown;
  updated_at: unknown;
}

interface BrandRow {
  id: string;
  project_id: string | null;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_primary: string;
  font_secondary: string;
  logo_url: string | null;
  tagline: string | null;
  metadata: Record<string, unknown> | null;
  created_at: unknown;
  updated_at: unknown;
}

interface DocumentRow {
  id: string;
  project_id: string | null;
  objective_id: string | null;
  brand_id: string | null;
  title: string;
  document_type: string;
  status: string;
  content: string;
  storage_key: string | null;
  storage_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: unknown;
  updated_at: unknown;
}

interface PackageRow {
  id: string;
  project_id: string | null;
  objective_id: string | null;
  document_id: string | null;
  name: string;
  package_type: string;
  status: string;
  manifest_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: unknown;
  updated_at: unknown;
}

interface EvolutionProposalRow {
  id: string;
  project_id: string | null;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  analysis_period: string;
  evidence: string[] | null;
  metadata: Record<string, unknown> | null;
  created_at: unknown;
  updated_at: unknown;
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function toNullableIsoString(value: unknown): string | null {
  if (value == null) return null;
  return toIsoString(value);
}

function toObject(value: Record<string, unknown> | null | undefined): Record<string, unknown> {
  return value ?? {};
}

function buildUpdateFields(fields: Record<string, unknown>): { clause: string; values: unknown[] } {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
  return {
    clause: entries.map(([column], index) => `${column} = $${index + 1}`).join(", "),
    values: entries.map(([, value]) => value),
  };
}

abstract class RepositoryBase {
  constructor(protected readonly queryFn: QueryFn = query) {}

  protected async one<T>(sql: string, params?: unknown[]): Promise<T | null> {
    const result = await this.queryFn<T>(sql, params);
    return result.rows[0] ?? null;
  }

  protected async many<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.queryFn<T>(sql, params);
    return result.rows;
  }

  protected async remove(sql: string, params?: unknown[]): Promise<boolean> {
    const result = await this.queryFn(sql, params);
    return (result.rowCount ?? 0) > 0;
  }
}

function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    name: row.name,
    role: row.role,
    status: row.status,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description,
    status: row.status,
    metadata: toObject(row.metadata),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapObjective(row: ObjectiveRow): Objective {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: toNullableIsoString(row.due_date),
    orchestrationStatus: row.orchestration_status,
    metadata: toObject(row.metadata),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapResearchFinding(row: ResearchFindingRow): ResearchFindingRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    objectiveId: row.objective_id,
    domain: row.domain,
    topic: row.topic,
    summary: row.summary,
    details: row.details,
    sources: row.sources ?? [],
    confidence: row.confidence,
    relevanceScore: row.relevance_score,
    metadata: toObject(row.metadata),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapBrand(row: BrandRow): BrandRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    accentColor: row.accent_color,
    fontPrimary: row.font_primary,
    fontSecondary: row.font_secondary,
    logoUrl: row.logo_url,
    tagline: row.tagline,
    metadata: toObject(row.metadata),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapDocument(row: DocumentRow): DocumentRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    objectiveId: row.objective_id,
    brandId: row.brand_id,
    title: row.title,
    type: row.document_type,
    status: row.status,
    content: row.content,
    storageKey: row.storage_key,
    storageUrl: row.storage_url,
    metadata: toObject(row.metadata),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapPackage(row: PackageRow): PackageRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    objectiveId: row.objective_id,
    documentId: row.document_id,
    name: row.name,
    type: row.package_type,
    status: row.status,
    manifestUrl: row.manifest_url,
    metadata: toObject(row.metadata),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapEvolutionProposal(row: EvolutionProposalRow): EvolutionProposalRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    analysisPeriod: row.analysis_period,
    evidence: row.evidence ?? [],
    metadata: toObject(row.metadata),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export class UserRepository extends RepositoryBase {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const row = await this.one<UserRow>("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
    return row ? mapUser(row) : null;
  }

  async create(input: {
    id: string;
    email: string;
    passwordHash: string;
    name?: string | null;
    role?: string;
    status?: string;
  }): Promise<UserRecord | null> {
    const row = await this.one<UserRow>(
      `INSERT INTO users (id, email, password_hash, name, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.id,
        input.email,
        input.passwordHash,
        input.name ?? null,
        input.role ?? "user",
        input.status ?? "active",
      ]
    );
    return row ? mapUser(row) : null;
  }
}

export class ProjectRepository extends RepositoryBase {
  async list(ownerId?: string): Promise<Project[]> {
    const rows = ownerId
      ? await this.many<ProjectRow>("SELECT * FROM projects WHERE owner_id = $1 ORDER BY created_at DESC", [ownerId])
      : await this.many<ProjectRow>("SELECT * FROM projects ORDER BY created_at DESC");
    return rows.map(mapProject);
  }

  async getById(id: string): Promise<Project | null> {
    const row = await this.one<ProjectRow>("SELECT * FROM projects WHERE id = $1 LIMIT 1", [id]);
    return row ? mapProject(row) : null;
  }

  async create(input: {
    id: string;
    ownerId?: string | null;
    name: string;
    description?: string | null;
    status?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Project | null> {
    const row = await this.one<ProjectRow>(
      `INSERT INTO projects (id, owner_id, name, description, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.id,
        input.ownerId ?? null,
        input.name,
        input.description ?? null,
        input.status ?? "draft",
        input.metadata ?? {},
      ]
    );
    return row ? mapProject(row) : null;
  }

  async update(
    id: string,
    input: {
      name?: string;
      description?: string | null;
      status?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<Project | null> {
    const update = buildUpdateFields({
      name: input.name,
      description: input.description,
      status: input.status,
      metadata: input.metadata,
    });
    if (!update.clause) return this.getById(id);
    const row = await this.one<ProjectRow>(
      `UPDATE projects SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`,
      [...update.values, id]
    );
    return row ? mapProject(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.remove("DELETE FROM projects WHERE id = $1", [id]);
  }
}

export class ObjectiveRepository extends RepositoryBase {
  async list(projectId?: string): Promise<Objective[]> {
    const rows = projectId
      ? await this.many<ObjectiveRow>("SELECT * FROM objectives WHERE project_id = $1 ORDER BY created_at DESC", [projectId])
      : await this.many<ObjectiveRow>("SELECT * FROM objectives ORDER BY created_at DESC");
    return rows.map(mapObjective);
  }

  async getById(id: string): Promise<Objective | null> {
    const row = await this.one<ObjectiveRow>("SELECT * FROM objectives WHERE id = $1 LIMIT 1", [id]);
    return row ? mapObjective(row) : null;
  }

  async create(input: {
    id: string;
    projectId: string;
    title: string;
    description?: string | null;
    status?: string;
    priority?: string;
    dueDate?: string | null;
    orchestrationStatus?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Objective | null> {
    const row = await this.one<ObjectiveRow>(
      `INSERT INTO objectives (
         id, project_id, title, description, status, priority, due_date, orchestration_status, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        input.id,
        input.projectId,
        input.title,
        input.description ?? null,
        input.status ?? "pending",
        input.priority ?? "medium",
        input.dueDate ?? null,
        input.orchestrationStatus ?? "idle",
        input.metadata ?? {},
      ]
    );
    return row ? mapObjective(row) : null;
  }

  async update(
    id: string,
    input: {
      title?: string;
      description?: string | null;
      status?: string;
      priority?: string;
      dueDate?: string | null;
      orchestrationStatus?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<Objective | null> {
    const update = buildUpdateFields({
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      due_date: input.dueDate,
      orchestration_status: input.orchestrationStatus,
      metadata: input.metadata,
    });
    if (!update.clause) return this.getById(id);
    const row = await this.one<ObjectiveRow>(
      `UPDATE objectives SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`,
      [...update.values, id]
    );
    return row ? mapObjective(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.remove("DELETE FROM objectives WHERE id = $1", [id]);
  }
}

export class ResearchFindingRepository extends RepositoryBase {
  async list(projectId?: string): Promise<ResearchFindingRecord[]> {
    const rows = projectId
      ? await this.many<ResearchFindingRow>("SELECT * FROM research_findings WHERE project_id = $1 ORDER BY created_at DESC", [projectId])
      : await this.many<ResearchFindingRow>("SELECT * FROM research_findings ORDER BY created_at DESC");
    return rows.map(mapResearchFinding);
  }

  async getById(id: string): Promise<ResearchFindingRecord | null> {
    const row = await this.one<ResearchFindingRow>("SELECT * FROM research_findings WHERE id = $1 LIMIT 1", [id]);
    return row ? mapResearchFinding(row) : null;
  }

  async create(input: {
    id: string;
    projectId?: string | null;
    objectiveId?: string | null;
    domain: string;
    topic: string;
    summary: string;
    details: string;
    sources?: string[];
    confidence?: string;
    relevanceScore?: number;
    metadata?: Record<string, unknown>;
  }): Promise<ResearchFindingRecord | null> {
    const row = await this.one<ResearchFindingRow>(
      `INSERT INTO research_findings (
         id, project_id, objective_id, domain, topic, summary, details, sources, confidence, relevance_score, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        input.id,
        input.projectId ?? null,
        input.objectiveId ?? null,
        input.domain,
        input.topic,
        input.summary,
        input.details,
        input.sources ?? [],
        input.confidence ?? "medium",
        input.relevanceScore ?? 0,
        input.metadata ?? {},
      ]
    );
    return row ? mapResearchFinding(row) : null;
  }

  async update(
    id: string,
    input: {
      domain?: string;
      topic?: string;
      summary?: string;
      details?: string;
      sources?: string[];
      confidence?: string;
      relevanceScore?: number;
      metadata?: Record<string, unknown>;
    }
  ): Promise<ResearchFindingRecord | null> {
    const update = buildUpdateFields({
      domain: input.domain,
      topic: input.topic,
      summary: input.summary,
      details: input.details,
      sources: input.sources,
      confidence: input.confidence,
      relevance_score: input.relevanceScore,
      metadata: input.metadata,
    });
    if (!update.clause) return this.getById(id);
    const row = await this.one<ResearchFindingRow>(
      `UPDATE research_findings SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`,
      [...update.values, id]
    );
    return row ? mapResearchFinding(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.remove("DELETE FROM research_findings WHERE id = $1", [id]);
  }
}

export class BrandRepository extends RepositoryBase {
  async list(projectId?: string): Promise<BrandRecord[]> {
    const rows = projectId
      ? await this.many<BrandRow>("SELECT * FROM brands WHERE project_id = $1 ORDER BY created_at DESC", [projectId])
      : await this.many<BrandRow>("SELECT * FROM brands ORDER BY created_at DESC");
    return rows.map(mapBrand);
  }

  async getById(id: string): Promise<BrandRecord | null> {
    const row = await this.one<BrandRow>("SELECT * FROM brands WHERE id = $1 LIMIT 1", [id]);
    return row ? mapBrand(row) : null;
  }

  async create(input: {
    id: string;
    projectId?: string | null;
    name: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontPrimary: string;
    fontSecondary: string;
    logoUrl?: string | null;
    tagline?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<BrandRecord | null> {
    const row = await this.one<BrandRow>(
      `INSERT INTO brands (
         id, project_id, name, primary_color, secondary_color, accent_color, font_primary, font_secondary, logo_url, tagline, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        input.id,
        input.projectId ?? null,
        input.name,
        input.primaryColor,
        input.secondaryColor,
        input.accentColor,
        input.fontPrimary,
        input.fontSecondary,
        input.logoUrl ?? null,
        input.tagline ?? null,
        input.metadata ?? {},
      ]
    );
    return row ? mapBrand(row) : null;
  }

  async update(
    id: string,
    input: {
      name?: string;
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      fontPrimary?: string;
      fontSecondary?: string;
      logoUrl?: string | null;
      tagline?: string | null;
      metadata?: Record<string, unknown>;
    }
  ): Promise<BrandRecord | null> {
    const update = buildUpdateFields({
      name: input.name,
      primary_color: input.primaryColor,
      secondary_color: input.secondaryColor,
      accent_color: input.accentColor,
      font_primary: input.fontPrimary,
      font_secondary: input.fontSecondary,
      logo_url: input.logoUrl,
      tagline: input.tagline,
      metadata: input.metadata,
    });
    if (!update.clause) return this.getById(id);
    const row = await this.one<BrandRow>(
      `UPDATE brands SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`,
      [...update.values, id]
    );
    return row ? mapBrand(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.remove("DELETE FROM brands WHERE id = $1", [id]);
  }
}

export class DocumentRepository extends RepositoryBase {
  async list(projectId?: string): Promise<DocumentRecord[]> {
    const rows = projectId
      ? await this.many<DocumentRow>("SELECT * FROM documents WHERE project_id = $1 ORDER BY created_at DESC", [projectId])
      : await this.many<DocumentRow>("SELECT * FROM documents ORDER BY created_at DESC");
    return rows.map(mapDocument);
  }

  async getById(id: string): Promise<DocumentRecord | null> {
    const row = await this.one<DocumentRow>("SELECT * FROM documents WHERE id = $1 LIMIT 1", [id]);
    return row ? mapDocument(row) : null;
  }

  async create(input: {
    id: string;
    projectId?: string | null;
    objectiveId?: string | null;
    brandId?: string | null;
    title: string;
    type: string;
    status?: string;
    content?: string;
    storageKey?: string | null;
    storageUrl?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<DocumentRecord | null> {
    const row = await this.one<DocumentRow>(
      `INSERT INTO documents (
         id, project_id, objective_id, brand_id, title, document_type, status, content, storage_key, storage_url, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        input.id,
        input.projectId ?? null,
        input.objectiveId ?? null,
        input.brandId ?? null,
        input.title,
        input.type,
        input.status ?? "draft",
        input.content ?? "",
        input.storageKey ?? null,
        input.storageUrl ?? null,
        input.metadata ?? {},
      ]
    );
    return row ? mapDocument(row) : null;
  }

  async update(
    id: string,
    input: {
      title?: string;
      type?: string;
      status?: string;
      content?: string;
      storageKey?: string | null;
      storageUrl?: string | null;
      metadata?: Record<string, unknown>;
    }
  ): Promise<DocumentRecord | null> {
    const update = buildUpdateFields({
      title: input.title,
      document_type: input.type,
      status: input.status,
      content: input.content,
      storage_key: input.storageKey,
      storage_url: input.storageUrl,
      metadata: input.metadata,
    });
    if (!update.clause) return this.getById(id);
    const row = await this.one<DocumentRow>(
      `UPDATE documents SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`,
      [...update.values, id]
    );
    return row ? mapDocument(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.remove("DELETE FROM documents WHERE id = $1", [id]);
  }
}

export class PackageRepository extends RepositoryBase {
  async list(projectId?: string): Promise<PackageRecord[]> {
    const rows = projectId
      ? await this.many<PackageRow>("SELECT * FROM packages WHERE project_id = $1 ORDER BY created_at DESC", [projectId])
      : await this.many<PackageRow>("SELECT * FROM packages ORDER BY created_at DESC");
    return rows.map(mapPackage);
  }

  async getById(id: string): Promise<PackageRecord | null> {
    const row = await this.one<PackageRow>("SELECT * FROM packages WHERE id = $1 LIMIT 1", [id]);
    return row ? mapPackage(row) : null;
  }

  async create(input: {
    id: string;
    projectId?: string | null;
    objectiveId?: string | null;
    documentId?: string | null;
    name: string;
    type: string;
    status?: string;
    manifestUrl?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<PackageRecord | null> {
    const row = await this.one<PackageRow>(
      `INSERT INTO packages (
         id, project_id, objective_id, document_id, name, package_type, status, manifest_url, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        input.id,
        input.projectId ?? null,
        input.objectiveId ?? null,
        input.documentId ?? null,
        input.name,
        input.type,
        input.status ?? "draft",
        input.manifestUrl ?? null,
        input.metadata ?? {},
      ]
    );
    return row ? mapPackage(row) : null;
  }

  async update(
    id: string,
    input: {
      name?: string;
      type?: string;
      status?: string;
      manifestUrl?: string | null;
      metadata?: Record<string, unknown>;
    }
  ): Promise<PackageRecord | null> {
    const update = buildUpdateFields({
      name: input.name,
      package_type: input.type,
      status: input.status,
      manifest_url: input.manifestUrl,
      metadata: input.metadata,
    });
    if (!update.clause) return this.getById(id);
    const row = await this.one<PackageRow>(
      `UPDATE packages SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`,
      [...update.values, id]
    );
    return row ? mapPackage(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.remove("DELETE FROM packages WHERE id = $1", [id]);
  }
}

export class EvolutionProposalRepository extends RepositoryBase {
  async list(projectId?: string): Promise<EvolutionProposalRecord[]> {
    const rows = projectId
      ? await this.many<EvolutionProposalRow>("SELECT * FROM evolution_proposals WHERE project_id = $1 ORDER BY created_at DESC", [projectId])
      : await this.many<EvolutionProposalRow>("SELECT * FROM evolution_proposals ORDER BY created_at DESC");
    return rows.map(mapEvolutionProposal);
  }

  async getById(id: string): Promise<EvolutionProposalRecord | null> {
    const row = await this.one<EvolutionProposalRow>("SELECT * FROM evolution_proposals WHERE id = $1 LIMIT 1", [id]);
    return row ? mapEvolutionProposal(row) : null;
  }

  async create(input: {
    id: string;
    projectId?: string | null;
    title: string;
    description: string;
    category: string;
    priority?: string;
    status?: string;
    analysisPeriod?: string;
    evidence?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<EvolutionProposalRecord | null> {
    const row = await this.one<EvolutionProposalRow>(
      `INSERT INTO evolution_proposals (
         id, project_id, title, description, category, priority, status, analysis_period, evidence, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        input.id,
        input.projectId ?? null,
        input.title,
        input.description,
        input.category,
        input.priority ?? "medium",
        input.status ?? "proposed",
        input.analysisPeriod ?? "last_30_days",
        input.evidence ?? [],
        input.metadata ?? {},
      ]
    );
    return row ? mapEvolutionProposal(row) : null;
  }

  async update(
    id: string,
    input: {
      title?: string;
      description?: string;
      category?: string;
      priority?: string;
      status?: string;
      analysisPeriod?: string;
      evidence?: string[];
      metadata?: Record<string, unknown>;
    }
  ): Promise<EvolutionProposalRecord | null> {
    const update = buildUpdateFields({
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      status: input.status,
      analysis_period: input.analysisPeriod,
      evidence: input.evidence,
      metadata: input.metadata,
    });
    if (!update.clause) return this.getById(id);
    const row = await this.one<EvolutionProposalRow>(
      `UPDATE evolution_proposals SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`,
      [...update.values, id]
    );
    return row ? mapEvolutionProposal(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.remove("DELETE FROM evolution_proposals WHERE id = $1", [id]);
  }
}
