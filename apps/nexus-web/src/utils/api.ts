// ---------------------------------------------------------------------------
// API Client — typed client for all Nexus API routes
// ---------------------------------------------------------------------------

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Objective {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ObjectiveStatus {
  objectiveId: string;
  sessionId?: string;
  status: string;
  agentTasks?: unknown[];
}

export interface EvolutionProposal {
  id: string;
  title: string;
  description: string;
  status: string;
  impactScore: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

function getAuthToken(): string | null {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("nexus_token");
  }
  return process.env.NEXUS_API_TOKEN ?? null;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function apiRequest<T>(
  baseUrl: string,
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: buildHeaders(),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json().catch(() => null);
    return { data: data as T, status: response.status };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Request failed", status: 0 };
  }
}

export interface NexusApiClient {
  auth: {
    login: (credentials: AuthCredentials) => Promise<ApiResponse<{ token: string; user: unknown }>>;
    register: (data: RegisterData) => Promise<ApiResponse<{ token: string; user: unknown }>>;
    me: () => Promise<ApiResponse<{ id: string; email: string; name?: string }>>;
  };
  projects: {
    list: (params?: Record<string, string>) => Promise<ApiResponse<Project[]>>;
    get: (id: string) => Promise<ApiResponse<Project>>;
    create: (data: Partial<Project>) => Promise<ApiResponse<Project>>;
    update: (id: string, data: Partial<Project>) => Promise<ApiResponse<Project>>;
    delete: (id: string) => Promise<ApiResponse<void>>;
  };
  objectives: {
    list: (params?: Record<string, string>) => Promise<ApiResponse<Objective[]>>;
    get: (id: string) => Promise<ApiResponse<Objective>>;
    create: (data: Partial<Objective>) => Promise<ApiResponse<{ objectiveId: string; sessionId?: string; status: string }>>;
    update: (id: string, data: Partial<Objective>) => Promise<ApiResponse<Objective>>;
    delete: (id: string) => Promise<ApiResponse<void>>;
    getStatus: (id: string) => Promise<ApiResponse<ObjectiveStatus>>;
  };
  chefDrew: {
    createBlueprint: (context: Record<string, unknown>) => Promise<ApiResponse<unknown>>;
    listBlueprints: () => Promise<ApiResponse<unknown[]>>;
    submitObjective: (objective: Record<string, unknown>) => Promise<ApiResponse<unknown>>;
  };
  evolution: {
    getProposals: (params?: { status?: string }) => Promise<ApiResponse<EvolutionProposal[]>>;
    runCycle: () => Promise<ApiResponse<unknown>>;
  };
}

export function createApiClient(baseUrl: string): NexusApiClient {
  const req = <T>(method: string, path: string, body?: unknown) =>
    apiRequest<T>(baseUrl, method, path, body);

  return {
    auth: {
      login: (credentials) => req<{ token: string; user: unknown }>("POST", "/api/auth/login", credentials),
      register: (data) => req<{ token: string; user: unknown }>("POST", "/api/auth/register", data),
      me: () => req<{ id: string; email: string; name?: string }>("GET", "/api/auth/me"),
    },
    projects: {
      list: (params) => {
        const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
        return req<Project[]>("GET", `/api/projects${qs}`);
      },
      get: (id) => req<Project>("GET", `/api/projects/${id}`),
      create: (data) => req<Project>("POST", "/api/projects", data),
      update: (id, data) => req<Project>("PATCH", `/api/projects/${id}`, data),
      delete: (id) => req<void>("DELETE", `/api/projects/${id}`),
    },
    objectives: {
      list: (params) => {
        const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
        return req<Objective[]>("GET", `/api/objectives${qs}`);
      },
      get: (id) => req<Objective>("GET", `/api/objectives/${id}`),
      create: (data) =>
        req<{ objectiveId: string; sessionId?: string; status: string }>("POST", "/api/objectives", data),
      update: (id, data) => req<Objective>("PATCH", `/api/objectives/${id}`, data),
      delete: (id) => req<void>("DELETE", `/api/objectives/${id}`),
      getStatus: (id) => req<ObjectiveStatus>("GET", `/api/objectives/${id}/status`),
    },
    chefDrew: {
      createBlueprint: (context) => req("POST", "/api/chef-drew/blueprints", context),
      listBlueprints: () => req<unknown[]>("GET", "/api/chef-drew/blueprints"),
      submitObjective: (objective) => req("POST", "/api/chef-drew/objectives", objective),
    },
    evolution: {
      getProposals: (params) => {
        const qs = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
        return req<EvolutionProposal[]>("GET", `/api/evolution/proposals${qs}`);
      },
      runCycle: () => req("POST", "/api/evolution/run"),
    },
  };
}

const DEFAULT_BASE_URL =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
    : "http://localhost:3000";

export const apiClient = createApiClient(DEFAULT_BASE_URL);
