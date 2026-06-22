/**
 * llm.test.ts
 * Tests for LLM service with graceful degradation.
 */

jest.mock(
  "openai",
  () => ({
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockImplementation(async (options: Record<string, unknown>) => {
            if (options.stream) {
              return {
                async *[Symbol.asyncIterator]() {
                  yield { choices: [{ delta: { content: "Hello " } }] };
                  yield { choices: [{ delta: { content: "World" } }] };
                },
              };
            }
            if (options.response_format) {
              return {
                choices: [{ message: { content: '{"test":"string"}' } }],
                usage: { total_tokens: 100 },
              };
            }
            return {
              choices: [{ message: { content: "Mock LLM response" } }],
              usage: { total_tokens: 100 },
            };
          }),
        },
      },
    })),
  }),
  { virtual: true }
);

describe("LLM Service", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe("completeChat", () => {
    it("should return a string response", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      const { completeChat } = require("../src/services/llm");
      const response = await completeChat([{ role: "user" as const, content: "Hello" }]);
      expect(typeof response).toBe("string");
      expect(response).toBe("Mock LLM response");
    });

    it("should return stub response when API key not set", async () => {
      delete process.env.OPENAI_API_KEY;
      const { completeChat } = require("../src/services/llm");
      const response = await completeChat([{ role: "user" as const, content: "Test message" }]);
      expect(typeof response).toBe("string");
      expect(response.length).toBeGreaterThan(0);
    });

    it("should accept options parameter", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      const { completeChat } = require("../src/services/llm");
      const response = await completeChat(
        [{ role: "user" as const, content: "Test" }],
        { model: "gpt-4", temperature: 0.5, maxTokens: 100 }
      );
      expect(typeof response).toBe("string");
    });
  });

  describe("structuredOutput", () => {
    it("should return parsed object", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      const { structuredOutput } = require("../src/services/llm");
      const result = await structuredOutput<{ test: string }>(
        [{ role: "user" as const, content: "Return JSON" }],
        '{"test": "string"}'
      );
      expect(result).toEqual({ test: "string" });
    });

    it("should return empty object on degradation", async () => {
      delete process.env.OPENAI_API_KEY;
      const { structuredOutput } = require("../src/services/llm");
      const result = await structuredOutput([{ role: "user" as const, content: "Test" }], "{}");
      expect(typeof result).toBe("object");
      expect(result).toEqual({});
    });
  });

  describe("streamCompletion", () => {
    it("should call onChunk callback", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      const { streamCompletion } = require("../src/services/llm");
      const chunks: string[] = [];
      await streamCompletion(
        [{ role: "user" as const, content: "Stream test" }],
        (chunk: string) => chunks.push(chunk)
      );
      expect(chunks.join("")).toBe("Hello World");
    });

    it("should call onChunk with stub when no API key", async () => {
      delete process.env.OPENAI_API_KEY;
      const { streamCompletion } = require("../src/services/llm");
      const chunks: string[] = [];
      await streamCompletion(
        [{ role: "user" as const, content: "Test" }],
        (chunk: string) => chunks.push(chunk)
      );
      expect(chunks.length).toBeGreaterThanOrEqual(1);
    });
  });
});
