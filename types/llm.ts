export abstract class GenAiModel {

    protected model;

    constructor(model: string) {
        this.model = model
    }

    abstract generateResponse(prompt: string) : Promise<LlmResponse>
}

export type LlmResponse = {
    text: string,
}