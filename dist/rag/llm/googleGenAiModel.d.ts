import type { GenAiModel, LlmResponse } from "../../types/llm.js";
export default class googleGenAiModel implements GenAiModel {
    private ai;
    private modelName;
    private temperature;
    private maxOutputTokens;
    constructor(apiKey: string);
    generateResponse(prompt: string): Promise<LlmResponse>;
}
//# sourceMappingURL=googleGenAiModel.d.ts.map