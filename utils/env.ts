import dotenv from 'dotenv'

dotenv.config({ path: '../.env'})

type environmentArgs = {
    wikiUrl: string,
    wikiJSToken: string,
    geminiApiKey: string | undefined,
    qdrantUrl: string,
    wikiBaseUrl: string,
    qdrantApiKey: string | undefined,
    qdrantClusterEndpoint: string | undefined,
    port: number,
    genModel: 'google' | 'ollama'
}

export const environment = {
    wikiUrl: process.env.WIKI_URL,
    wikiJSToken: process.env.WIKIJSTOKEN,
    geminiApiKey: process.env.GEMINI_API_KEY,
    qdrantUrl: process.env.QDRANT_URL,
    wikiBaseUrl: process.env.WIKI_BASE_URL,
    qdrantApiKey: process.env.QDRANT_API_KEY,
    qdrantClusterEndpoint: process.env.QDRANT_CLUSTER_ENDPOINT,
    port: process.env.BACKEND_PORT || 3000,
    genModel: process.env.GEN_MODEL || 'google'
}