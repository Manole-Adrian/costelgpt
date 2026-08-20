import "dotenv/config";
import { embedText } from "../services/embeddings.js";
import { createSparseVector } from "../services/sparse.js";
import { client as qdrant } from "../services/qdrant.js";
import { environment } from "../config/env.ts";
import costelGptTones from "./tones.js"
import type { GenAiModel } from "../types/llm.js";
import settings from "../config/settings.ts";
import { COLLECTION_NAME, DENSE_VECTOR_NAME, SPARSE_VECTOR_NAME } from "../services/constants.ts";
import { getPrompt } from "./constants.ts";
import GenAiModelFactory from "./llm/GenAiModelFactory.ts";

// Initialize with error handling
const llmFactory = new GenAiModelFactory();
let model: GenAiModel
try {
  model = llmFactory.getModel(settings.llm.provider, settings.llm.model, {
    apiKey: environment.llmApiKey,
    maxOutputTokens: settings.llm.maxOutputTokens,
    temperature: settings.llm.temperature
  })
  console.log("LLM Model initialized");
} catch (error: any) {
  console.error("Failed to initialize model:", error.message);
  process.exit(1);
}

export async function ragQuery(question: string, tone: string, options = {}) {

  const limit = settings.rag.sourcesLimit
  // Cosine similarity is bounded 0-1, so an absolute cutoff is meaningful.
  const denseScoreThreshold = settings.rag.denseScoreThreshold
  // IDF scores are an unbounded sum over matched terms, so their magnitude
  // only means something relative to the best hit for the same question.
  const sparseScoreRatio = settings.rag.sparseScoreRatio

  try {
    console.log(`🔍 Processing question: "${question}"`);
    
    // 1. Generate query embedding
    const queryVector = await embedText(question);
    
    console.log('Sparse search');
    const sparseSearchResults = await qdrant.query(COLLECTION_NAME, {
      query: createSparseVector(question),
      using: SPARSE_VECTOR_NAME,
      limit: limit * 2,
      with_payload: true,
      with_vector: false,
      params: {
        indexed_only: true
      }
    });

    // Anchor the cutoff to this query's best hit instead of a fixed number.
    const topSparseScore = sparseSearchResults.points
      .reduce((best, point) => Math.max(best, point.score), 0);
    const sparseCutoff = topSparseScore * sparseScoreRatio;

    // The score rule is passed in because dense and sparse scores live on
    // different scales and cannot share a single cutoff.
    const validateResults = (
      results: typeof sparseSearchResults.points,
      keepScore: (score: number) => boolean
    ) => results
      .filter(r => {
        const hasText = r.payload?.text && typeof r.payload.text === 'string';
        return hasText && keepScore(r.score);
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

      let filteredResults = validateResults(
        sparseSearchResults.points,
        score => score >= sparseCutoff
      );
      console.log(`📊 Sparse search found ${sparseSearchResults.points.length} potential matches`);
      console.log(`   Top sparse score ${topSparseScore.toFixed(3)}, keeping ≥ ${sparseCutoff.toFixed(3)}`);
    // DENSE SEARCH
    

    if (filteredResults.length === 0) {
      // 2. Search Qdrant with filters
      const denseSearchResults = await qdrant.query(COLLECTION_NAME, {
        query: queryVector,
        using: DENSE_VECTOR_NAME,
        limit: limit * 2,
        with_payload: true,
        with_vector: false,
        score_threshold: denseScoreThreshold,
        params: {
          hnsw_ef: settings.rag.denseHnswEf
        }
      });

      filteredResults = validateResults(
        denseSearchResults.points,
        score => score >= denseScoreThreshold
      );
      console.log(`📊 Dense search found ${denseSearchResults.points.length} potential matches`);
    }

    if (filteredResults.length === 0) {
      return {
        answer: "I couldn't find relevant information to answer your question.",
        sources: [],
        scores: [],
        confidence: 0
      };
    }

    console.log(`✅ ${filteredResults.length} results passed validation`);

    if (filteredResults.length === 0) {
      return {
        answer: "I found some documents but none contained usable text content.",
        sources: [],
        scores: [],
        confidence: 0
      };
    }

    // 3. Build context with source attribution
    let context = "";
    const sources = [];
    
    for (const [index, result] of filteredResults.entries()) {
      const text: any = result.payload?.text || "No text content available";
      const sourceText = `[Source ${index + 1} - Score: ${result.score.toFixed(3)}]\n${text}`;
      
      if (context.length + sourceText.length > settings.rag.maxContentLength) {
        console.log(`⚠️ Stopping at source ${index + 1} due to context limit`);
        break;
      }
      
      context += sourceText + "\n\n";
      sources.push({
        index: index + 1,
        score: result.score,
        title: result.payload?.title || 'Unknown',
        path: result.payload?.path || 'Unknown',
        chunkIndex: result.payload?.chunkIndex || 0,
        textPreview: text
      });
    }

    console.log(`📚 Using ${sources.length} sources for context`);
    sources.forEach(({title,score,textPreview}) => {
      console.log(`Source title: ${title}`)
      console.log(`Score: ${score}`)
      // console.log(`Text Preview: ${textPreview}`)
    })
    console.log(`📝 Context length: ${context.length} characters`);

    // Only proceed if we have context
    if (context.trim().length === 0) {
      return {
        answer: "Could not extract usable text from the search results.",
        sources: [],
        scores: [],
        confidence: 0
      };
    }

    // 4. Build prompt

    const tonePrompt: string = (costelGptTones as any)[tone]

    const prompt = getPrompt(context,tonePrompt,question);

    // 5. Generate answer using new Gemini SDK
    const response = await model.generateResponse(prompt);

    const answer = response.text;
    if(!filteredResults[0]) {
      throw Error("No results");
    }

    return {
      answer,
      sources,
      scores: filteredResults.map(r => r.score),
      confidence: filteredResults.length > 0 ? filteredResults[0].score : 0,
      totalSources: filteredResults.length
    };

  } catch (error: any) {
    console.error("❌ RAG query failed:", error.message);
    console.error("Stack:", error.stack);
    
    return {
      answer: "I encountered an error while processing your question. Please try again.",
      sources: [],
      scores: [],
      confidence: 0,
      error: error.message
    };
  }
}