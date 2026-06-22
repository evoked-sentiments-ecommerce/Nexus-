/**
 * api.test.ts
 * Tests for the web API client.
 */

const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

import { apiClient, createApiClient } from "../src/utils/api";

describe("createApiClient", () => {
  const BASE_URL = "http://localhost:3000";
  const OLD_ENV = process.env;
  let client: ReturnType<typeof createApiClient>;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    client = createApiClient(BASE_URL);
    mockFetch.mockReset();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("should create a client with auth methods", () => {
    expect(client.auth).toBeDefined();
    expect(client.auth.login).toBeInstanceOf(Function);
    expect(client.auth.register).toBeInstanceOf(Function);
    expect(client.auth.me).toBeInstanceOf(Function);
  });

  it("should create a client with projects methods", () => {
    expect(client.projects).toBeDefined();
    expect(client.projects.list).toBeInstanceOf(Function);
    expect(client.projects.get).toBeInstanceOf(Function);
    expect(client.projects.create).toBeInstanceOf(Function);
    expect(client.projects.update).toBeInstanceOf(Function);
    expect(client.projects.delete).toBeInstanceOf(Function);
  });

  it("should create a client with objectives methods", () => {
    expect(client.objectives).toBeDefined();
    expect(client.objectives.list).toBeInstanceOf(Function);
    expect(client.objectives.create).toBeInstanceOf(Function);
    expect(client.objectives.getStatus).toBeInstanceOf(Function);
  });

  it("should create a client with chefDrew methods", () => {
    expect(client.chefDrew).toBeDefined();
    expect(client.chefDrew.createBlueprint).toBeInstanceOf(Function);
    expect(client.chefDrew.listBlueprints).toBeInstanceOf(Function);
  });

  it("should create a client with evolution methods", () => {
    expect(client.evolution).toBeDefined();
    expect(client.evolution.getProposals).toBeInstanceOf(Function);
    expect(client.evolution.runCycle).toBeInstanceOf(Function);
  });

  it("should include Authorization header when token is available", async () => {
    process.env.NEXUS_API_TOKEN = "token-123";
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ token: "test", user: {} }),
      status: 200,
    });
    await client.auth.login({ email: "test@example.com", password: "password" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/login"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer token-123" }),
      })
    );
  });

  it("should handle fetch errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const result = await client.projects.list();
    expect(result.error).toBeDefined();
    expect(result.status).toBe(0);
  });

  it("should include Content-Type header in requests", async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => [], status: 200 });
    await client.projects.list();
    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].headers["Content-Type"]).toBe("application/json");
  });
});

describe("apiClient singleton", () => {
  it("should be exported as a singleton", () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.auth).toBeDefined();
    expect(apiClient.projects).toBeDefined();
  });
});
