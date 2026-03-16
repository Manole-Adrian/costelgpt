
import { ragQuery } from '../rag/search.js'

export default async function getPrompt(query: string, tone:string , jwt:string ) {
    
        const result = await ragQuery(query, tone);

        return result
}