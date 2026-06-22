"use strict";
// ---------------------------------------------------------------------------
// LLM Integration Layer — OpenAI chat completions with graceful degradation
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeChat = completeChat;
exports.structuredOutput = structuredOutput;
exports.streamCompletion = streamCompletion;
const logger_1 = require("../logger");
const DEFAULT_MODEL = "gpt-4o-mini";
function getClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        (0, logger_1.logWarn)("llm_degraded", { reason: "OPENAI_API_KEY not set" });
        return null;
    }
    try {
        const { OpenAI } = require("openai");
        return new OpenAI({ apiKey });
    }
    catch {
        (0, logger_1.logWarn)("llm_degraded", { reason: "openai package not available" });
        return null;
    }
}
async function completeChat(messages, options = {}) {
    const client = getClient();
    if (!client) {
        (0, logger_1.logWarn)("llm_stub_response", { messageCount: messages.length });
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
        (0, logger_1.logInfo)("llm_completion", {
            model: options.model ?? DEFAULT_MODEL,
            tokens: response.usage?.total_tokens,
        });
        return content;
    }
    catch (err) {
        (0, logger_1.logError)("llm_error", { message: err instanceof Error ? err.message : String(err) });
        return `[LLM error: ${err instanceof Error ? err.message : "unknown"}]`;
    }
}
async function structuredOutput(messages, schema, options = {}) {
    const systemMessage = {
        role: "system",
        content: `You must respond with valid JSON matching this schema: ${schema}. Respond only with JSON.`,
    };
    const allMessages = [systemMessage, ...messages];
    const client = getClient();
    if (!client) {
        (0, logger_1.logWarn)("llm_structured_stub", {});
        return {};
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
        return JSON.parse(content);
    }
    catch (err) {
        (0, logger_1.logError)("llm_structured_error", { message: err instanceof Error ? err.message : String(err) });
        return {};
    }
}
async function streamCompletion(messages, onChunk, options = {}) {
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
    }
    catch (err) {
        (0, logger_1.logError)("llm_stream_error", { message: err instanceof Error ? err.message : String(err) });
        onChunk(`[Stream error: ${err instanceof Error ? err.message : "unknown"}]`);
    }
}
//# sourceMappingURL=index.js.map