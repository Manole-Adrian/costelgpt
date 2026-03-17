import { QdrantClient } from '@qdrant/js-client-rest';
import { environment } from '../utils/env.js';
const client = new QdrantClient({
    url: environment.qdrantClusterEndpoint,
    apiKey: environment.qdrantApiKey,
});
const COLLECTION_NAME = 'wiki';
const VECTOR_DIMENSION = 384; // this MUST match embeddings model
export async function ensureCollection() {
    try {
        const collections = await client.getCollections();
        let collectionExists = collections.collections.some(c => c.name === COLLECTION_NAME);
        if (collectionExists) {
            const info = await client.getCollection(COLLECTION_NAME);
            const currentDim = info.config.params.vectors.size;
            if (currentDim !== VECTOR_DIMENSION) {
                console.log(`Deleting old collection (has ${currentDim} dimensions, need ${VECTOR_DIMENSION})...`);
                await client.deleteCollection(COLLECTION_NAME);
                collectionExists = false;
            }
        }
        if (!collectionExists) {
            console.log(`Creating new collection with ${VECTOR_DIMENSION} dimensions...`);
            await client.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_DIMENSION,
                    distance: 'Cosine'
                },
                optimizers_config: {
                    default_segment_number: 2
                }
            });
            console.log(`Collection '${COLLECTION_NAME}' created with ${VECTOR_DIMENSION} dimensions`);
        }
        else {
            console.log(`Collection '${COLLECTION_NAME}' already exists with correct dimensions`);
        }
        return true;
    }
    catch (error) {
        console.error('Failed to ensure collection:', error);
        throw error;
    }
}
export { client };
//# sourceMappingURL=qdrant.js.map