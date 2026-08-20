import { GoogleGenAI } from "@google/genai";
import { type LlmResponse, GenAiModel } from "../../types/llm.js";

type GoogleGenAiParams = {
    apiKey: string,
    temperature: number,
    maxOutputTokens: number
}

export default class googleGenAiModel extends GenAiModel {
    private ai;
    private temperature;
    private maxOutputTokens;
    
    constructor(model:string, params: GoogleGenAiParams) {
        super(model)
        this.ai = new GoogleGenAI({ apiKey: params.apiKey!})
        this.temperature = params.temperature
        this.maxOutputTokens = params.maxOutputTokens
    }

    async generateResponse(prompt: string): Promise<LlmResponse> {
        const result = await this.ai.models.generateContent({
            model: this.model,
            contents: prompt,
            config: {
                temperature: this.temperature,
                maxOutputTokens: this.maxOutputTokens,
            }
        });

        return (result as LlmResponse);
    }
}