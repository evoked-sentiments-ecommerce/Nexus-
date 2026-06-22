"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionProposalRepository = exports.PackageRepository = exports.DocumentRepository = exports.BrandRepository = exports.ResearchFindingRepository = exports.ObjectiveRepository = exports.ProjectRepository = exports.UserRepository = void 0;
const connection_1 = require("../connection");
function toIsoString(value) {
    if (value instanceof Date)
        return value.toISOString();
    if (typeof value === "string")
        return value;
    return new Date().toISOString();
}
function toNullableIsoString(value) {
    if (value == null)
        return null;
    return toIsoString(value);
}
function toObject(value) {
    return value ?? {};
}
function buildUpdateFields(fields) {
    const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
    return {
        clause: entries.map(([column], index) => `${column} = $${index + 1}`).join(", "),
        values: entries.map(([, value]) => value),
    };
}
class RepositoryBase {
    constructor(queryFn = connection_1.query) {
        this.queryFn = queryFn;
    }
    async one(sql, params) {
        const result = await this.queryFn(sql, params);
        return result.rows[0] ?? null;
    }
    async many(sql, params) {
        const result = await this.queryFn(sql, params);
        return result.rows;
    }
    async remove(sql, params) {
        const result = await this.queryFn(sql, params);
        return (result.rowCount ?? 0) > 0;
    }
}
function mapUser(row) {
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
function mapProject(row) {
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
function mapObjective(row) {
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
function mapResearchFinding(row) {
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
function mapBrand(row) {
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
function mapDocument(row) {
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
function mapPackage(row) {
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
function mapEvolutionProposal(row) {
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
class UserRepository extends RepositoryBase {
    async findByEmail(email) {
        const row = await this.one("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
        return row ? mapUser(row) : null;
    }
    async create(input) {
        const row = await this.one(`INSERT INTO users (id, email, password_hash, name, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [
            input.id,
            input.email,
            input.passwordHash,
            input.name ?? null,
            input.role ?? "user",
            input.status ?? "active",
        ]);
        return row ? mapUser(row) : null;
    }
}
exports.UserRepository = UserRepository;
class ProjectRepository extends RepositoryBase {
    async list(ownerId) {
        const rows = ownerId
            ? await this.many("SELECT * FROM projects WHERE owner_id = $1 ORDER BY created_at DESC", [ownerId])
            : await this.many("SELECT * FROM projects ORDER BY created_at DESC");
        return rows.map(mapProject);
    }
    async getById(id) {
        const row = await this.one("SELECT * FROM projects WHERE id = $1 LIMIT 1", [id]);
        return row ? mapProject(row) : null;
    }
    async create(input) {
        const row = await this.one(`INSERT INTO projects (id, owner_id, name, description, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [
            input.id,
            input.ownerId ?? null,
            input.name,
            input.description ?? null,
            input.status ?? "draft",
            input.metadata ?? {},
        ]);
        return row ? mapProject(row) : null;
    }
    async update(id, input) {
        const update = buildUpdateFields({
            name: input.name,
            description: input.description,
            status: input.status,
            metadata: input.metadata,
        });
        if (!update.clause)
            return this.getById(id);
        const row = await this.one(`UPDATE projects SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`, [...update.values, id]);
        return row ? mapProject(row) : null;
    }
    async delete(id) {
        return this.remove("DELETE FROM projects WHERE id = $1", [id]);
    }
}
exports.ProjectRepository = ProjectRepository;
class ObjectiveRepository extends RepositoryBase {
    async list(projectId) {
        const rows = projectId
            ? await this.many("SELECT * FROM objectives WHERE project_id = $1 ORDER BY created_at DESC", [projectId])
            : await this.many("SELECT * FROM objectives ORDER BY created_at DESC");
        return rows.map(mapObjective);
    }
    async getById(id) {
        const row = await this.one("SELECT * FROM objectives WHERE id = $1 LIMIT 1", [id]);
        return row ? mapObjective(row) : null;
    }
    async create(input) {
        const row = await this.one(`INSERT INTO objectives (
         id, project_id, title, description, status, priority, due_date, orchestration_status, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`, [
            input.id,
            input.projectId,
            input.title,
            input.description ?? null,
            input.status ?? "pending",
            input.priority ?? "medium",
            input.dueDate ?? null,
            input.orchestrationStatus ?? "idle",
            input.metadata ?? {},
        ]);
        return row ? mapObjective(row) : null;
    }
    async update(id, input) {
        const update = buildUpdateFields({
            title: input.title,
            description: input.description,
            status: input.status,
            priority: input.priority,
            due_date: input.dueDate,
            orchestration_status: input.orchestrationStatus,
            metadata: input.metadata,
        });
        if (!update.clause)
            return this.getById(id);
        const row = await this.one(`UPDATE objectives SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`, [...update.values, id]);
        return row ? mapObjective(row) : null;
    }
    async delete(id) {
        return this.remove("DELETE FROM objectives WHERE id = $1", [id]);
    }
}
exports.ObjectiveRepository = ObjectiveRepository;
class ResearchFindingRepository extends RepositoryBase {
    async list(projectId) {
        const rows = projectId
            ? await this.many("SELECT * FROM research_findings WHERE project_id = $1 ORDER BY created_at DESC", [projectId])
            : await this.many("SELECT * FROM research_findings ORDER BY created_at DESC");
        return rows.map(mapResearchFinding);
    }
    async getById(id) {
        const row = await this.one("SELECT * FROM research_findings WHERE id = $1 LIMIT 1", [id]);
        return row ? mapResearchFinding(row) : null;
    }
    async create(input) {
        const row = await this.one(`INSERT INTO research_findings (
         id, project_id, objective_id, domain, topic, summary, details, sources, confidence, relevance_score, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`, [
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
        ]);
        return row ? mapResearchFinding(row) : null;
    }
    async update(id, input) {
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
        if (!update.clause)
            return this.getById(id);
        const row = await this.one(`UPDATE research_findings SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`, [...update.values, id]);
        return row ? mapResearchFinding(row) : null;
    }
    async delete(id) {
        return this.remove("DELETE FROM research_findings WHERE id = $1", [id]);
    }
}
exports.ResearchFindingRepository = ResearchFindingRepository;
class BrandRepository extends RepositoryBase {
    async list(projectId) {
        const rows = projectId
            ? await this.many("SELECT * FROM brands WHERE project_id = $1 ORDER BY created_at DESC", [projectId])
            : await this.many("SELECT * FROM brands ORDER BY created_at DESC");
        return rows.map(mapBrand);
    }
    async getById(id) {
        const row = await this.one("SELECT * FROM brands WHERE id = $1 LIMIT 1", [id]);
        return row ? mapBrand(row) : null;
    }
    async create(input) {
        const row = await this.one(`INSERT INTO brands (
         id, project_id, name, primary_color, secondary_color, accent_color, font_primary, font_secondary, logo_url, tagline, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`, [
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
        ]);
        return row ? mapBrand(row) : null;
    }
    async update(id, input) {
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
        if (!update.clause)
            return this.getById(id);
        const row = await this.one(`UPDATE brands SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`, [...update.values, id]);
        return row ? mapBrand(row) : null;
    }
    async delete(id) {
        return this.remove("DELETE FROM brands WHERE id = $1", [id]);
    }
}
exports.BrandRepository = BrandRepository;
class DocumentRepository extends RepositoryBase {
    async list(projectId) {
        const rows = projectId
            ? await this.many("SELECT * FROM documents WHERE project_id = $1 ORDER BY created_at DESC", [projectId])
            : await this.many("SELECT * FROM documents ORDER BY created_at DESC");
        return rows.map(mapDocument);
    }
    async getById(id) {
        const row = await this.one("SELECT * FROM documents WHERE id = $1 LIMIT 1", [id]);
        return row ? mapDocument(row) : null;
    }
    async create(input) {
        const row = await this.one(`INSERT INTO documents (
         id, project_id, objective_id, brand_id, title, document_type, status, content, storage_key, storage_url, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`, [
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
        ]);
        return row ? mapDocument(row) : null;
    }
    async update(id, input) {
        const update = buildUpdateFields({
            title: input.title,
            document_type: input.type,
            status: input.status,
            content: input.content,
            storage_key: input.storageKey,
            storage_url: input.storageUrl,
            metadata: input.metadata,
        });
        if (!update.clause)
            return this.getById(id);
        const row = await this.one(`UPDATE documents SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`, [...update.values, id]);
        return row ? mapDocument(row) : null;
    }
    async delete(id) {
        return this.remove("DELETE FROM documents WHERE id = $1", [id]);
    }
}
exports.DocumentRepository = DocumentRepository;
class PackageRepository extends RepositoryBase {
    async list(projectId) {
        const rows = projectId
            ? await this.many("SELECT * FROM packages WHERE project_id = $1 ORDER BY created_at DESC", [projectId])
            : await this.many("SELECT * FROM packages ORDER BY created_at DESC");
        return rows.map(mapPackage);
    }
    async getById(id) {
        const row = await this.one("SELECT * FROM packages WHERE id = $1 LIMIT 1", [id]);
        return row ? mapPackage(row) : null;
    }
    async create(input) {
        const row = await this.one(`INSERT INTO packages (
         id, project_id, objective_id, document_id, name, package_type, status, manifest_url, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`, [
            input.id,
            input.projectId ?? null,
            input.objectiveId ?? null,
            input.documentId ?? null,
            input.name,
            input.type,
            input.status ?? "draft",
            input.manifestUrl ?? null,
            input.metadata ?? {},
        ]);
        return row ? mapPackage(row) : null;
    }
    async update(id, input) {
        const update = buildUpdateFields({
            name: input.name,
            package_type: input.type,
            status: input.status,
            manifest_url: input.manifestUrl,
            metadata: input.metadata,
        });
        if (!update.clause)
            return this.getById(id);
        const row = await this.one(`UPDATE packages SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`, [...update.values, id]);
        return row ? mapPackage(row) : null;
    }
    async delete(id) {
        return this.remove("DELETE FROM packages WHERE id = $1", [id]);
    }
}
exports.PackageRepository = PackageRepository;
class EvolutionProposalRepository extends RepositoryBase {
    async list(projectId) {
        const rows = projectId
            ? await this.many("SELECT * FROM evolution_proposals WHERE project_id = $1 ORDER BY created_at DESC", [projectId])
            : await this.many("SELECT * FROM evolution_proposals ORDER BY created_at DESC");
        return rows.map(mapEvolutionProposal);
    }
    async getById(id) {
        const row = await this.one("SELECT * FROM evolution_proposals WHERE id = $1 LIMIT 1", [id]);
        return row ? mapEvolutionProposal(row) : null;
    }
    async create(input) {
        const row = await this.one(`INSERT INTO evolution_proposals (
         id, project_id, title, description, category, priority, status, analysis_period, evidence, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`, [
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
        ]);
        return row ? mapEvolutionProposal(row) : null;
    }
    async update(id, input) {
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
        if (!update.clause)
            return this.getById(id);
        const row = await this.one(`UPDATE evolution_proposals SET ${update.clause}, updated_at = NOW() WHERE id = $${update.values.length + 1} RETURNING *`, [...update.values, id]);
        return row ? mapEvolutionProposal(row) : null;
    }
    async delete(id) {
        return this.remove("DELETE FROM evolution_proposals WHERE id = $1", [id]);
    }
}
exports.EvolutionProposalRepository = EvolutionProposalRepository;
//# sourceMappingURL=index.js.map