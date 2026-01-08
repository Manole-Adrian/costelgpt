import { pipeline } from '@xenova/transformers';

let localEmbedder: any = null;
const TARGET_DIMENSIONS = 1024; // For bge-small-en-v1.5

function validateEmbedding(vector:any[]) {
    const cleaned = vector.map(value => {
        const num = parseFloat(value);
        if (isNaN(num)) {
            console.warn(`Invalid embedding value: ${value}, replacing with 0`);
            return 0;
        }
        return num;
    });
    
    if (cleaned.length !== TARGET_DIMENSIONS) {
        console.warn(`Vector dimension mismatch: ${cleaned.length} != ${TARGET_DIMENSIONS}`);
    }
    
    const magnitude = Math.sqrt(cleaned.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
        return cleaned.map(val => val / magnitude);
    }
    
    return cleaned;
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

export async function embedText(text: string) {
    try {
        // console.log(`Generating embedding for text (${text.length} chars)...`);
        
        if (!localEmbedder) {
            console.log('Loading bge-small-en-v1.5 model...');
            localEmbedder = await pipeline('feature-extraction', 'Xenova/multilingual-e5-large');
        }
        
        const output = await localEmbedder(text, { 
            pooling: 'mean', 
            normalize: true 
        });
        
        let vector = Array.from(output.data);
        
        debugVector(vector, 'Raw embedding');
        
        vector = validateEmbedding(vector);
        
        debugVector(vector, 'Cleaned embedding');
        
        return vector;
        
    } catch (error) {
        console.error('Embedding failed:', error);
        
        console.warn('Returning zero vector as fallback');
        return new Array(TARGET_DIMENSIONS).fill(0);
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