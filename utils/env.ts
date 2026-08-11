import dotenv from 'dotenv'

dotenv.config({ path: '../.env'})

type environmentArgs = {
    wikiUrl: string,
    wikiJSToken: string | undefined,
    geminiApiKey: string | undefined,
    qdrantUrl: string | undefined,
    wikiBaseUrl: string,
    qdrantApiKey: string | undefined,
    qdrantClusterEndpoint: string | undefined,
    port: string,
    genModel: string,
    firebaseProjectId: string,
    authDevBypass: boolean,
}

export const environment : environmentArgs = {
    wikiUrl: process.env.WIKI_URL || "https://wiki.eestec.ro/graphql",
    wikiJSToken: process.env.WIKIJSTOKEN,
    geminiApiKey: process.env.GEMINI_API_KEY,
    qdrantUrl: process.env.QDRANT_URL,
    wikiBaseUrl: process.env.WIKI_BASE_URL || "https://wiki.eestec.ro/",
    qdrantApiKey: process.env.QDRANT_API_KEY,
    qdrantClusterEndpoint: process.env.QDRANT_CLUSTER_ENDPOINT,
    port: process.env.BACKEND_PORT || "3000",
    genModel: process.env.GEN_MODEL || 'google',
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'costelgpt-2e51d',
    authDevBypass: process.env.AUTH_DEV_BYPASS === 'true',
}