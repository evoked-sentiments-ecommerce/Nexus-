// ---------------------------------------------------------------------------
// LLM Integration Layer — OpenAI chat completions with graceful degradation
// ---------------------------------------------------------------------------

import { logInfo, logWarn, logError } from "../logger";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

const DEFAULT_MODEL = "gpt-4o-mini";

function getClient(): any {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logWarn("llm_degraded", { reason: "OPENAI_API_KEY not set" });
    return null;
  }

  try {
    const { OpenAI } = require("openai");
    return new OpenAI({ apiKey });
  } catch {
    logWarn("llm_degraded", { reason: "openai package not available" });
    return null;
  }
}

export async function completeChat(
  messages: ChatMessage[],
  options: LLMOptions = {}
): Promise<string> {
  const client = getClient();
  if (!client) {
    logWarn("llm_stub_response", { messageCount: messages.length });
    return `[Stub LLM response for: ${messages[messages.length - 1]?.content?.slice(0, 50) ?? "unknown"}]`;
  }

  try {
    const response = await client.chat.completions.create({
      model: options.model ?? DEFAULT_MODEL,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      messages,
    });
    const content = response.choices[0]?.message?.content ?? "";
    logInfo("llm_completion", {
      model: options.model ?? DEFAULT_MODEL,
      tokens: response.usage?.total_tokens,
    });
    return content;
  } catch (err) {
    logError("llm_error", { message: err instanceof Error ? err.message : String(err) });
    return `[LLM error: ${err instanceof Error ? err.message : "unknown"}]`;
  }
}

export async function structuredOutput<T>(
  messages: ChatMessage[],
  schema: string,
  options: LLMOptions = {}
): Promise<T> {
  const systemMessage: ChatMessage = {
    role: "system",
    content: `You must respond with valid JSON matching this schema: ${schema}. Respond only with JSON.`,
  };
  const allMessages = [systemMessage, ...messages];
  const client = getClient();
  if (!client) {
    logWarn("llm_structured_stub", {});
    return {} as T;
  }

  try {
    const response = await client.chat.completions.create({
      model: options.model ?? DEFAULT_MODEL,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 3000,
      response_format: { type: "json_object" },
      messages: allMessages,
    });
    const content = response.choices[0]?.message?.content ?? "{}";
    return JSON.parse(content) as T;
  } catch (err) {
    logError("llm_structured_error", { message: err instanceof Error ? err.message : String(err) });
    return {} as T;
  }
}

export async function streamCompletion(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  options: LLMOptions = {}
): Promise<void> {
  const client = getClient();
  if (!client) {
    onChunk("[Stub stream response]");
    return;
  }

  try {
    const stream = await client.chat.completions.create({
      model: options.model ?? DEFAULT_MODEL,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? "";
      if (content) {
        onChunk(content);
      }
    }
  } catch (err) {
    logError("llm_stream_error", { message: err instanceof Error ? err.message : String(err) });
    onChunk(`[Stream error: ${err instanceof Error ? err.message : "unknown"}]`);
  }
}
