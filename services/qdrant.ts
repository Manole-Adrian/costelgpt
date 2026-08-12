import { QdrantClient } from '@qdrant/js-client-rest';
import { environment } from '../utils/env.js';
import settings from '../config/settings.ts';

const client = new QdrantClient({
    url: environment.qdrantClusterEndpoint!,
    apiKey: environment.qdrantApiKey!,
});

const COLLECTION_NAME = 'wiki';
const VECTOR_DIMENSION = settings.rag.vectorDimensions; // this MUST match embeddings model
const DENSE_VECTOR_NAME = 'dense';
const SPARSE_VECTOR_NAME = 'sparse';

// Deleting a page's old chunks filters on these fields, and Qdrant refuses to
// filter on a payload field that has no index.
const PAYLOAD_INDEXES = [
  { field: 'pageId', schema: 'integer' },
  { field: 'filePath', schema: 'keyword' },
] as const;

async function ensurePayloadIndexes() {
  for (const { field, schema } of PAYLOAD_INDEXES) {
    try {
      await client.createPayloadIndex(COLLECTION_NAME, {
        field_name: field,
        field_schema: schema,
        wait: true
      });
    } catch (error: any) {
      const detail = error.data?.status?.error ?? error.message;
      console.error(`Failed to create payload index for '${field}':`, detail);
    }
  }
}

export async function ensureCollection() {
  try {
    const collections = await client.getCollections();
    let collectionExists = collections.collections.some(c => c.name === COLLECTION_NAME);
    
    if (collectionExists) {
      const info = await client.getCollection(COLLECTION_NAME);
      const vectors = info.config.params.vectors;
      const currentDim = vectors && typeof vectors === 'object' && 'size' in vectors
        ? vectors.size
        : vectors?.[DENSE_VECTOR_NAME]?.size;
      const hasExpectedSparseVector = Boolean(info.config.params.sparse_vectors?.[SPARSE_VECTOR_NAME]);
      
      if (currentDim !== VECTOR_DIMENSION || !hasExpectedSparseVector) {
        console.log('Deleting old collection because its vector schema does not support dense and sparse search...');
        await client.deleteCollection(COLLECTION_NAME);
        collectionExists = false;
      }
    }
    
    if (!collectionExists) {
      console.log(`Creating new collection with ${VECTOR_DIMENSION} dimensions...`);
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          [DENSE_VECTOR_NAME]: {
            size: VECTOR_DIMENSION,
            distance: 'Cosine'
          }
        },
        sparse_vectors: {
          [SPARSE_VECTOR_NAME]: {
            modifier: 'idf'
          }
        },
        optimizers_config: {
          default_segment_number: 2
        }
      });
      console.log(`Collection '${COLLECTION_NAME}' created with ${VECTOR_DIMENSION} dimensions`);
    } else {
      console.log(`Collection '${COLLECTION_NAME}' already exists with correct dimensions`);
    }

    await ensurePayloadIndexes();

    return true;
  } catch (error) {
    console.error('Failed to ensure collection:', error);
    throw error;
  }
}

export { client };