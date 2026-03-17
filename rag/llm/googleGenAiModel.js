import { GoogleGenAI } from "@google/genai";
export default class googleGenAiModel {
    constructor(apiKey) {
        this.ai = new GoogleGenAI({ apiKey: apiKey });
        this.modelName = "gemini-2.5-flash";
        this.temperature = 0.1;
        this.maxOutputTokens = 4096;
    }
    async generateResponse(prompt) {
        const result = await this.ai.models.generateContent({
            model: this.modelName,
            contents: prompt,
            config: {
                temperature: this.temperature,
                maxOutputTokens: this.maxOutputTokens,
            }
        });
        return result;
    }
}
//# sourceMappingURL=googleGenAiModel.js.map