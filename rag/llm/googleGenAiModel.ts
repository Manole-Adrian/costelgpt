import { GoogleGenAI } from "@google/genai";
import type { GenAiModel, LlmResponse } from "../../types/llm.js";

export default class googleGenAiModel implements GenAiModel {
    private ai;
    private modelName;
    private temperature;
    private maxOutputTokens;
    
    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({ apiKey: apiKey!})
        this.modelName = "gemini-3.5-flash-lite"
        this.temperature = 0.1
        this.maxOutputTokens = 4096
    }

    async generateResponse(prompt: string): Promise<LlmResponse> {
        const result = await this.ai.models.generateContent({
            model: this.modelName,
            contents: prompt,
            config: {
                temperature: this.temperature,
                maxOutputTokens: this.maxOutputTokens,
            }
        });

        return (result as LlmResponse);
    }
}