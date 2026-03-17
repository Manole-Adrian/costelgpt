import { ragQuery } from '../rag/search.js';
export default async function getPrompt(query, tone) {
    const result = await ragQuery(query, tone);
    return result;
}
//# sourceMappingURL=controller.js.map