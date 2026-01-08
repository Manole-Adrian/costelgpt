export interface GenAiModel {
    generateResponse(prompt: string): Promise<LlmResponse>;
}
export type LlmResponse = {
    text: string;
};
//# sourceMappingURL=llm.d.ts.map