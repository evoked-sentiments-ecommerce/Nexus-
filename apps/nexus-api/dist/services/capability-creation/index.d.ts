export interface CapabilitySpec {
    specId: string;
    name: string;
    description: string;
    domain: string;
    inputs: FieldDefinition[];
    outputs: FieldDefinition[];
    dependencies: string[];
    integrations: string[];
    generatedAt: string;
}
export interface FieldDefinition {
    name: string;
    type: string;
    description: string;
    required: boolean;
}
export interface Architecture {
    architectureId: string;
    capabilityName: string;
    pattern: "service" | "microservice" | "module" | "agent" | "pipeline";
    components: ArchitectureComponent[];
    dataFlow: string[];
    storageRequirements: string[];
    integrationPoints: string[];
    securityConsiderations: string[];
    generatedAt: string;
}
export interface ArchitectureComponent {
    name: string;
    type: "api" | "service" | "worker" | "store" | "queue" | "cache";
    description: string;
    responsibilities: string[];
}
export interface RepositoryScaffold {
    scaffoldId: string;
    capabilityName: string;
    files: ScaffoldFile[];
    migrations: MigrationDefinition[];
    tests: TestDefinition[];
    generatedAt: string;
}
export interface ScaffoldFile {
    path: string;
    type: "typescript" | "sql" | "json" | "yaml" | "markdown";
    purpose: string;
    template: string;
}
export interface MigrationDefinition {
    migrationId: string;
    name: string;
    upSql: string;
    downSql: string;
}
export interface TestDefinition {
    testId: string;
    name: string;
    type: "unit" | "integration" | "e2e";
    description: string;
    scenarios: string[];
}
export interface DeploymentPlan {
    planId: string;
    capabilityName: string;
    environments: DeploymentEnvironment[];
    rolloutStrategy: "blue_green" | "canary" | "rolling" | "immediate";
    rollbackPlan: string[];
    healthChecks: string[];
    generatedAt: string;
}
export interface DeploymentEnvironment {
    name: "development" | "staging" | "production";
    steps: string[];
    envVars: string[];
    resourceRequirements: string;
}
export declare function generateSpec(name: string, description: string, domain: string): Promise<CapabilitySpec>;
export declare function generateArchitecture(spec: CapabilitySpec): Promise<Architecture>;
export declare function generateScaffold(spec: CapabilitySpec, arch: Architecture): Promise<RepositoryScaffold>;
export declare function generateDeploymentPlan(spec: CapabilitySpec): Promise<DeploymentPlan>;
export declare function createCapability(name: string, description: string, domain: string): Promise<{
    spec: CapabilitySpec;
    architecture: Architecture;
    scaffold: RepositoryScaffold;
    deploymentPlan: DeploymentPlan;
}>;
//# sourceMappingURL=index.d.ts.map