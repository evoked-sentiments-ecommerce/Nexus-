export interface Capability {
    id?: string;
    name: string;
    domain: string;
    status: "active" | "inactive" | "deprecated";
    lastUsedAt?: string;
    performanceScore: number;
    coverageGaps: string[];
}
export interface CapabilityGapReport {
    reportId: string;
    generatedAt: string;
    totalCapabilities: number;
    activeCapabilities: number;
    gaps: Array<{
        domain: string;
        gap: string;
        severity: "high" | "medium" | "low";
    }>;
    recommendations: string[];
}
export declare function initializeRegistry(): Promise<void>;
export declare function getAll(): Promise<Capability[]>;
export declare function getByName(name: string): Promise<Capability | null>;
export declare function upsert(capability: Capability): Promise<Capability>;
export declare function recordUsage(name: string): Promise<void>;
export declare function updatePerformanceScore(name: string, score: number): Promise<void>;
export declare function detectGaps(objectives: string[], recentFailures: string[]): CapabilityGapReport;
//# sourceMappingURL=registry.d.ts.map