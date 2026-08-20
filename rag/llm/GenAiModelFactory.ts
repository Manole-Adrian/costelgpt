import type { GenAiModel } from "../../types/llm.ts"
import googleGenAiModel from "./googleGenAiModel.ts"
import ollamaGenAiModel from "./ollamaGenAiModel.ts"

type GenAiModelOptions = {
    /**
     * API key
     * Required by Google models
     */
    apiKey: string | undefined,
    /**
     * Maximum length of response (in tokens)
     * Supported by Google models
     */
    maxOutputTokens: number | undefined,
    /**
     * Inference setting for model randomness
     * Supported by Google models
     */
    temperature: number | undefined
}

export default class GenAiModelFactory {
    getModel(modelProvider: string, model: string, options: GenAiModelOptions): GenAiModel {
        console.log(`Trying ${modelProvider} - ${model}`)
        if(modelProvider === 'ollama') {
            return new ollamaGenAiModel(model)
        } else if (modelProvider === 'google') {
            const googleOptions = {
                apiKey: this.requireOptions(options.apiKey, "API Key"),
                maxOutputTokens: this.requireOptions(options.maxOutputTokens, "Max Output Tokens"),
                temperature: this.requireOptions(options.temperature, "Temperature")
            }
            return new googleGenAiModel(model, googleOptions)
        }

        throw Error("No matching providers were found")
    }

    // maybe move this to an utils place if needed elsewhere too?
    requireOptions<T>(value: T | undefined, name: string) {
        if (value === undefined) {
            throw new Error(`${name} is required for chosen model`)
        }

        return value
    }
}


// if(environment.genModel === 'google') {
//     llmModel = new googleGenAiModel(environment.geminiApiKey!)
//   } else if (environment.genModel === 'ollama') {
//     llmModel = new ollamaGenAiModel()
//   }