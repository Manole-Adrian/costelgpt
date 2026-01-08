import ollama from 'ollama';
export default class ollamaGenAiModel {
    modelName;
    constructor() {
        this.modelName = "llama3.1";
    }
    async generateResponse(prompt) {
        const response = await ollama.chat({
            model: this.modelName,
            messages: [{ role: 'user', content: prompt }]
        });
        const responseObject = { text: response.message.content };
        return responseObject;
    }
}
//# sourceMappingURL=ollamaGenAiModel.js.map