import { QueryResult } from "../connection";
export type QueryFn = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<QueryResult<T>>;
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
declare abstract class RepositoryBase {
    protected readonly queryFn: QueryFn;
    constructor(queryFn?: QueryFn);
    protected one<T>(sql: string, params?: unknown[]): Promise<T | null>;
    protected many<T>(sql: string, params?: unknown[]): Promise<T[]>;
    protected remove(sql: string, params?: unknown[]): Promise<boolean>;
}
export declare class UserRepository extends RepositoryBase {
    findByEmail(email: string): Promise<UserRecord | null>;
    create(input: {
        id: string;
        email: string;
        passwordHash: string;
        name?: string | null;
        role?: string;
        status?: string;
    }): Promise<UserRecord | null>;
}
export declare class ProjectRepository extends RepositoryBase {
    list(ownerId?: string): Promise<Project[]>;
    getById(id: string): Promise<Project | null>;
    create(input: {
        id: string;
        ownerId?: string | null;
        name: string;
        description?: string | null;
        status?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Project | null>;
    update(id: string, input: {
        name?: string;
        description?: string | null;
        status?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Project | null>;
    delete(id: string): Promise<boolean>;
}
export declare class ObjectiveRepository extends RepositoryBase {
    list(projectId?: string): Promise<Objective[]>;
    getById(id: string): Promise<Objective | null>;
    create(input: {
        id: string;
        projectId: string;
        title: string;
        description?: string | null;
        status?: string;
        priority?: string;
        dueDate?: string | null;
        orchestrationStatus?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Objective | null>;
    update(id: string, input: {
        title?: string;
        description?: string | null;
        status?: string;
        priority?: string;
        dueDate?: string | null;
        orchestrationStatus?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Objective | null>;
    delete(id: string): Promise<boolean>;
}
export declare class ResearchFindingRepository extends RepositoryBase {
    list(projectId?: string): Promise<ResearchFindingRecord[]>;
    getById(id: string): Promise<ResearchFindingRecord | null>;
    create(input: {
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
    }): Promise<ResearchFindingRecord | null>;
    update(id: string, input: {
        domain?: string;
        topic?: string;
        summary?: string;
        details?: string;
        sources?: string[];
        confidence?: string;
        relevanceScore?: number;
        metadata?: Record<string, unknown>;
    }): Promise<ResearchFindingRecord | null>;
    delete(id: string): Promise<boolean>;
}
export declare class BrandRepository extends RepositoryBase {
    list(projectId?: string): Promise<BrandRecord[]>;
    getById(id: string): Promise<BrandRecord | null>;
    create(input: {
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
    }): Promise<BrandRecord | null>;
    update(id: string, input: {
        name?: string;
        primaryColor?: string;
        secondaryColor?: string;
        accentColor?: string;
        fontPrimary?: string;
        fontSecondary?: string;
        logoUrl?: string | null;
        tagline?: string | null;
        metadata?: Record<string, unknown>;
    }): Promise<BrandRecord | null>;
    delete(id: string): Promise<boolean>;
}
export declare class DocumentRepository extends RepositoryBase {
    list(projectId?: string): Promise<DocumentRecord[]>;
    getById(id: string): Promise<DocumentRecord | null>;
    create(input: {
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
    }): Promise<DocumentRecord | null>;
    update(id: string, input: {
        title?: string;
        type?: string;
        status?: string;
        content?: string;
        storageKey?: string | null;
        storageUrl?: string | null;
        metadata?: Record<string, unknown>;
    }): Promise<DocumentRecord | null>;
    delete(id: string): Promise<boolean>;
}
export declare class PackageRepository extends RepositoryBase {
    list(projectId?: string): Promise<PackageRecord[]>;
    getById(id: string): Promise<PackageRecord | null>;
    create(input: {
        id: string;
        projectId?: string | null;
        objectiveId?: string | null;
        documentId?: string | null;
        name: string;
        type: string;
        status?: string;
        manifestUrl?: string | null;
        metadata?: Record<string, unknown>;
    }): Promise<PackageRecord | null>;
    update(id: string, input: {
        name?: string;
        type?: string;
        status?: string;
        manifestUrl?: string | null;
        metadata?: Record<string, unknown>;
    }): Promise<PackageRecord | null>;
    delete(id: string): Promise<boolean>;
}
export declare class EvolutionProposalRepository extends RepositoryBase {
    list(projectId?: string): Promise<EvolutionProposalRecord[]>;
    getById(id: string): Promise<EvolutionProposalRecord | null>;
    create(input: {
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
    }): Promise<EvolutionProposalRecord | null>;
    update(id: string, input: {
        title?: string;
        description?: string;
        category?: string;
        priority?: string;
        status?: string;
        analysisPeriod?: string;
        evidence?: string[];
        metadata?: Record<string, unknown>;
    }): Promise<EvolutionProposalRecord | null>;
    delete(id: string): Promise<boolean>;
}
export {};
//# sourceMappingURL=index.d.ts.map