import { pipeline } from '@xenova/transformers';
let localEmbedder = null;
const TARGET_DIMENSIONS = 1024; // For bge-small-en-v1.5
// Validate and clean embedding vector
function validateEmbedding(vector) {
    // Clean the vector: convert all values to numbers
    const cleaned = vector.map(value => {
        const num = parseFloat(value);
        if (isNaN(num)) {
            console.warn(`Invalid embedding value: ${value}, replacing with 0`);
            return 0;
        }
        return num;
    });
    // Check dimensions
    if (cleaned.length !== TARGET_DIMENSIONS) {
        console.warn(`Vector dimension mismatch: ${cleaned.length} != ${TARGET_DIMENSIONS}`);
    }
    // Optional: normalize if needed
    const magnitude = Math.sqrt(cleaned.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
        return cleaned.map(val => val / magnitude);
    }
    return cleaned;
}
// Debug function to inspect vectors
function debugVector(vector, label = 'Vector') {
    // console.log(`${label} - Length: ${vector.length}`);
    // console.log(`First 5 values: [${vector.slice(0, 5).join(', ')}]`);
    // console.log(`Min: ${Math.min(...vector)}, Max: ${Math.max(...vector)}`);
    // Check for invalid values
    const invalid = vector.filter(v => typeof v !== 'number' || isNaN(v));
    if (invalid.length > 0) {
        console.error(`Found ${invalid.length} invalid values:`, invalid.slice(0, 5));
    }
}
// Main embedding function with validation
export async function embedText(text) {
    try {
        // console.log(`Generating embedding for text (${text.length} chars)...`);
        // Load model if needed
        if (!localEmbedder) {
            console.log('Loading bge-small-en-v1.5 model...');
            localEmbedder = await pipeline('feature-extraction', 'Xenova/multilingual-e5-large');
        }
        // Generate embedding
        const output = await localEmbedder(text, {
            pooling: 'mean',
            normalize: true
        });
        // Extract and validate the vector
        let vector = Array.from(output.data);
        // Debug the raw vector
        debugVector(vector, 'Raw embedding');
        // Clean and validate
        vector = validateEmbedding(vector);
        // Debug the cleaned vector
        debugVector(vector, 'Cleaned embedding');
        // console.log(`Generated ${vector.length}D embedding`);
        return vector;
    }
    catch (error) {
        console.error('Embedding failed:', error);
        // Return a zero vector as fallback (better than invalid data)
        console.warn('Returning zero vector as fallback');
        return new Array(TARGET_DIMENSIONS).fill(0);
    }
}
// Optional: Test function
export async function testEmbedding() {
    const testText = "This is a test for the embedding model";
    const vector = await embedText(testText);
    console.log('\n=== Embedding Test Results ===');
    console.log(`Dimensions: ${vector.length}`);
    console.log(`Valid numbers: ${vector.every(v => typeof v === 'number' && !isNaN(v))}`);
    console.log(`Range: [${Math.min(...vector).toFixed(6)}, ${Math.max(...vector).toFixed(6)}]`);
    return vector;
}
//# sourceMappingURL=embeddings.js.map