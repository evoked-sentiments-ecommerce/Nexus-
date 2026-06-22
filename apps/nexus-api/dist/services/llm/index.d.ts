export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}
export interface LLMOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}
export declare function completeChat(messages: ChatMessage[], options?: LLMOptions): Promise<string>;
export declare function structuredOutput<T>(messages: ChatMessage[], schema: string, options?: LLMOptions): Promise<T>;
export declare function streamCompletion(messages: ChatMessage[], onChunk: (chunk: string) => void, options?: LLMOptions): Promise<void>;
//# sourceMappingURL=index.d.ts.map