// ---------------------------------------------------------------------------
// Capability Creation Engine — generates architectures, specifications,
// implementation plans, repository scaffolds, migrations, tests, and
// deployment plans to allow Nexus to continuously expand its own capabilities.
// ---------------------------------------------------------------------------

import { logInfo } from "../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Specification generation (stub — replace with LLM)
// ---------------------------------------------------------------------------

export async function generateSpec(
  name: string,
  description: string,
  domain: string
): Promise<CapabilitySpec> {
  logInfo("capability_creation_spec_generated", { name, domain });
  return {
    specId: `spec-${Date.now()}`,
    name,
    description,
    domain,
    inputs: [
      { name: "input", type: "Record<string, unknown>", description: "Primary input payload", required: true },
      { name: "context", type: "Record<string, unknown>", description: "Execution context", required: false },
    ],
    outputs: [
      { name: "result", type: "Record<string, unknown>", description: "Primary output", required: true },
      { name: "metadata", type: "Record<string, unknown>", description: "Execution metadata", required: false },
    ],
    dependencies: ["logger", "database"],
    integrations: [],
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Architecture generation (stub — replace with LLM)
// ---------------------------------------------------------------------------

export async function generateArchitecture(spec: CapabilitySpec): Promise<Architecture> {
  logInfo("capability_creation_architecture_generated", { specId: spec.specId, name: spec.name });
  return {
    architectureId: `arch-${Date.now()}`,
    capabilityName: spec.name,
    pattern: "service",
    components: [
      { name: `${spec.name}Service`, type: "service", description: `Core service for ${spec.name}`, responsibilities: ["Business logic", "Data validation", "Output generation"] },
      { name: `${spec.name}Repository`, type: "store", description: `Data persistence for ${spec.name}`, responsibilities: ["CRUD operations", "Query optimisation"] },
    ],
    dataFlow: [
      "Request → Service → Validation → Repository → Response",
      "Service → Logger → Monitoring",
    ],
    storageRequirements: ["PostgreSQL table for persistence", "In-memory cache for hot reads"],
    integrationPoints: spec.integrations,
    securityConsiderations: ["Input sanitisation", "Auth middleware", "Rate limiting"],
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Repository scaffold generation (stub — replace with LLM)
// ---------------------------------------------------------------------------

export async function generateScaffold(spec: CapabilitySpec, arch: Architecture): Promise<RepositoryScaffold> {
  logInfo("capability_creation_scaffold_generated", { name: spec.name });
  const svcPath = `apps/nexus-api/src/services/${spec.name.toLowerCase().replace(/\s+/g, "-")}/index.ts`;
  const routePath = `apps/nexus-api/src/routes/${spec.name.toLowerCase().replace(/\s+/g, "-")}.ts`;

  return {
    scaffoldId: `scaffold-${Date.now()}`,
    capabilityName: spec.name,
    files: [
      { path: svcPath, type: "typescript", purpose: "Service implementation", template: `// ${spec.name} service\n// Generated by Capability Creation Engine\n\nexport {};\n` },
      { path: routePath, type: "typescript", purpose: "API route handlers", template: `// ${spec.name} routes\n// Generated by Capability Creation Engine\n\nexport {};\n` },
    ],
    migrations: [
      {
        migrationId: `mig-${spec.name.toLowerCase()}-${Date.now()}`,
        name: `create_${spec.name.toLowerCase().replace(/\s+/g, "_")}_table`,
        upSql: `CREATE TABLE IF NOT EXISTS ${spec.name.toLowerCase().replace(/\s+/g, "_")}s (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  data JSONB NOT NULL DEFAULT '{}',\n  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n);`,
        downSql: `DROP TABLE IF EXISTS ${spec.name.toLowerCase().replace(/\s+/g, "_")}s;`,
      },
    ],
    tests: [
      {
        testId: `test-${spec.name.toLowerCase()}-unit`,
        name: `${spec.name} unit tests`,
        type: "unit",
        description: `Unit tests for ${spec.name} service`,
        scenarios: ["Happy path", "Invalid input", "Service error handling"],
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Deployment plan generation (stub — replace with LLM)
// ---------------------------------------------------------------------------

export async function generateDeploymentPlan(spec: CapabilitySpec): Promise<DeploymentPlan> {
  logInfo("capability_creation_deployment_plan_generated", { name: spec.name });
  return {
    planId: `deploy-${Date.now()}`,
    capabilityName: spec.name,
    environments: [
      { name: "development", steps: ["Run migrations", "Start service", "Run unit tests"], envVars: ["NODE_ENV=development"], resourceRequirements: "minimal" },
      { name: "staging", steps: ["Run migrations", "Deploy service", "Run integration tests", "Smoke test"], envVars: ["NODE_ENV=staging"], resourceRequirements: "standard" },
      { name: "production", steps: ["Run migrations", "Blue-green deploy", "Health check", "Monitor for 30min"], envVars: ["NODE_ENV=production"], resourceRequirements: "production" },
    ],
    rolloutStrategy: "blue_green",
    rollbackPlan: ["Revert deployment to previous version", "Run down migrations if needed", "Alert on-call"],
    healthChecks: [`GET /health/${spec.name.toLowerCase()}`, "Database connectivity check"],
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Full creation pipeline
// ---------------------------------------------------------------------------

export async function createCapability(
  name: string,
  description: string,
  domain: string
): Promise<{
  spec: CapabilitySpec;
  architecture: Architecture;
  scaffold: RepositoryScaffold;
  deploymentPlan: DeploymentPlan;
}> {
  const spec = await generateSpec(name, description, domain);
  const architecture = await generateArchitecture(spec);
  const scaffold = await generateScaffold(spec, architecture);
  const deploymentPlan = await generateDeploymentPlan(spec);

  logInfo("capability_creation_completed", { name, specId: spec.specId });
  return { spec, architecture, scaffold, deploymentPlan };
}
