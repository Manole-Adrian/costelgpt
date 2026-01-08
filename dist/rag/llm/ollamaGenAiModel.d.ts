import type { GenAiModel, LlmResponse } from '../../types/llm.js';
export default class ollamaGenAiModel implements GenAiModel {
    private modelName;
    constructor();
    generateResponse(prompt: string): Promise<LlmResponse>;
}
//# sourceMappingURL=ollamaGenAiModel.d.ts.map