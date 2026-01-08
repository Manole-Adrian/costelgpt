import { GoogleGenAI } from "@google/genai";
import { environment } from "../../utils/env.js";
export default class googleGenAiModel {
    ai;
    modelName;
    temperature;
    maxOutputTokens;
    constructor(apiKey) {
        this.ai = new GoogleGenAI({ apiKey: apiKey });
        this.modelName = "gemini-2.5-flash";
        this.temperature = 0.1;
        this.maxOutputTokens = 1000;
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