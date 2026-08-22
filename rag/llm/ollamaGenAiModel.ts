import ollama from 'ollama'
import { type LlmResponse, GenAiModel } from '../../types/llm.js';

export default class ollamaGenAiModel extends GenAiModel {
    constructor(model: string) {
        super(model)
    }

    async generateResponse(prompt: string): Promise<LlmResponse> {
        const response = await ollama.chat({
        model: this.model,
        messages: [{role: 'user', content: prompt}]
        });

        const responseObject = {text: response.message.content}

        return responseObject;
    }
}