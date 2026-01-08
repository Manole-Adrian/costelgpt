import ollama from 'ollama'
import type { GenAiModel, LlmResponse } from '../../types/llm.js';

export default class ollamaGenAiModel implements GenAiModel {
    private modelName;
    constructor() {
        this.modelName = "llama3.1"
    }

    async generateResponse(prompt: string): Promise<LlmResponse> {
        const response = await ollama.chat({
        model: this.modelName,
        messages: [{role: 'user', content: prompt}]
        });

        const responseObject = {text: response.message.content}

        return responseObject;
    }
}