import dotenv from 'dotenv'

dotenv.config({ path: '../.env'})

type EnvironmentConfig = {
    /**
     * URL to our wikijs graphql
     * @default 
     * https://wiki.eestec.ro/graphql
     */
    wikiUrl: string,
    /**
     * Personal Admin Wiki JS token
     */
    wikiJSToken: string | undefined,
    /**
     * When using Google AI Studio models, this is the required API key
     */
    geminiApiKey: string | undefined,
    /**
     * @deprecated
     * When using a local Qdrant instance, put the URL here
     */
    qdrantUrl: string | undefined,
    /**
     * URL to our wikijs instance
     */
    wikiBaseUrl: string,
    /**
     * Qdrant API key for the chosen cluster
     */
    qdrantApiKey: string | undefined,
    /**
     * Endpoint for the qdrant cluster 
     */
    qdrantClusterEndpoint: string | undefined,
    /**
     * Port the application uses
     */
    port: string,
    /**
     * LLM model the application will use. Either 'ollama' or 'google'
     */
    genModel: string,
    /**
     * Firebase Project ID to be used for checking token validity for auth.
     */
    firebaseProjectId: string,
    /**
     * Use dev bypass for auth
     */
    authDevBypass: boolean,
}

export const environment : EnvironmentConfig = {
    wikiUrl: process.env.WIKI_URL || "https://wiki.eestec.ro/graphql",
    wikiJSToken: process.env.WIKIJSTOKEN,
    geminiApiKey: process.env.GEMINI_API_KEY,
    qdrantUrl: process.env.QDRANT_URL,
    wikiBaseUrl: process.env.WIKI_BASE_URL || "https://wiki.eestec.ro/",
    qdrantApiKey: process.env.QDRANT_API_KEY,
    qdrantClusterEndpoint: process.env.QDRANT_CLUSTER_ENDPOINT,
    port: process.env.BACKEND_PORT || "3000",
    genModel: process.env.GEN_MODEL || 'google',
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'costel-676d9',
    authDevBypass: process.env.AUTH_DEV_BYPASS === 'true',
}