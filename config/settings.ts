
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
    },
    limiter: {
        windowMs: 600_000,
        messagesCount: 40
    }
}

export default settings;