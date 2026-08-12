import { pipeline } from '@xenova/transformers';
import settings from '../config/settings.ts';

let localEmbedder: any = null;
const TARGET_DIMENSIONS = settings.rag.vectorDimensions;

function validateEmbedding(vector:any[]) {
    const cleaned = vector.map(value => {
        const num = parseFloat(value);
        if (isNaN(num)) {
            throw new Error(`Embedding contained a non-numeric value: ${value}`);
        }
        return num;
    });

    if (cleaned.length !== TARGET_DIMENSIONS) {
        throw new Error(`Vector dimension mismatch: ${cleaned.length} != ${TARGET_DIMENSIONS}`);
    }

    const magnitude = Math.sqrt(cleaned.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) {
        throw new Error('Embedding is an all-zero vector, so it carries no meaning');
    }

    return cleaned.map(val => val / magnitude);
}

function debugVector(vector: any[], label = 'Vector') {
    // console.log(`${label} - Length: ${vector.length}`);
    // console.log(`First 5 values: [${vector.slice(0, 5).join(', ')}]`);
    // console.log(`Min: ${Math.min(...vector)}, Max: ${Math.max(...vector)}`);
    
    const invalid = vector.filter(v => typeof v !== 'number' || isNaN(v));
    if (invalid.length > 0) {
        console.error(`Found ${invalid.length} invalid values:`, invalid.slice(0, 5));
    }
}

export async function embedText(text: string): Promise<number[]> {
    try {
        
        if (!localEmbedder) {
            localEmbedder = await pipeline('feature-extraction', settings.rag.embeddingsModel, {
                quantized: true
            });
        }
        
        const output = await localEmbedder(text, { 
            pooling: 'mean', 
            normalize: true 
        });
        
        let vector: number[] = Array.from(output.data as ArrayLike<number>);

        debugVector(vector, 'Raw embedding');
        
        vector = validateEmbedding(vector);
        
        debugVector(vector, 'Cleaned embedding');
        
        return vector;
        
    } catch (error) {
        // Never fall back to a zero vector: it passes every sanity check but
        // matches nothing, so bad data would enter Qdrant unnoticed.
        console.error('Embedding failed:', error);
        throw error instanceof Error ? error : new Error(String(error));
    }
}

export async function testEmbedding() {
    const testText = "This is a test for the embedding model";
    const vector = await embedText(testText);
    
    console.log('\n=== Embedding Test Results ===');
    console.log(`Dimensions: ${vector.length}`);
    console.log(`Valid numbers: ${vector.every(v => typeof v === 'number' && !isNaN(v))}`);
    console.log(`Range: [${Math.min(...vector).toFixed(6)}, ${Math.max(...vector).toFixed(6)}]`);
    
    return vector;
}