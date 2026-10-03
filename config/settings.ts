
type SettingsConfig = {
    /**
     * Configuration settings for RAG (Ingestion and Searching)
     */
    rag: {
        /**
         * Model used for ingestions/dense search
         */
        embeddingsModel: string,
        /**
         * Embedding sizes. Is dependant on embeddingsModel
         */
        vectorDimensions: number,
        /**
         * Maximum amount of sources either dense or sparse search allows
         */
        sourcesLimit: number,
        /**
         * Minimum score for dense search to consider a source
         */
        denseScoreThreshold: number,
        /**
         * Applied to the highest sparse score to signify lowest accepted score
         */
        sparseScoreRatio: number,
        /**
         * Size of the dense candidate list for nearest-neighbour search during dense search
         */
        denseHnswEf: number,
        /**
         * Max length in characters of retrieved context
         */
        maxContentLength: number,
        /**
         * Whether to use local models or remote models for embeddings. If true, the embeddings model will be loaded from the local path specified in embeddingsModelPath. If false, the embeddings model will be loaded from the remote provider specified in embeddingsModel.
         */
        useLocalModels: boolean,
        /**
         * Path to the local embeddings model. This is only used if useLocalModels is true.
         */
        embeddingsModelPath: string
    },
    /**
     * Configration settings for the Request Rate Limiter
     */
    limiter: {
        /**
         * Duration of limiter time window
         */
        windowMs: number,
        /**
         * Maximum number of messages allowed during the limiter time window
         */
        messagesCount: number,
    },
    /**
     * Configuration settings for the LLM service
     */
    llm: {
        /**
         * Selected AI provider
         */
        provider: string,
        /**
         * Selected model
         */
        model: string,
        /**
         * Temperature param, affects model randomness. Required by Google models
         */
        temperature: number | undefined,
        /**
         * Maximum Output Tokens. Required by Google models
         */
        maxOutputTokens: number | undefined,
    }
}

const settings : SettingsConfig = {
    rag: {
        embeddingsModel: "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
        vectorDimensions: 384,
        sourcesLimit: 5,
        denseScoreThreshold: 0.5,
        sparseScoreRatio: 0.6,
        denseHnswEf: 256,
        maxContentLength: 6000,
        useLocalModels: false,
        embeddingsModelPath: "../models/"
    },
    limiter: {
        windowMs: 600_000,
        messagesCount: 40
    },
    llm: {
       provider: 'google',
       model: 'gemini-3.5-flash-lite',
       temperature: 1,
       maxOutputTokens: 4096,
    }
}

export default settings;