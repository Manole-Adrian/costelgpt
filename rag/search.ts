import "dotenv/config";
import { embedText } from "../services/embeddings.js";
import { createSparseVector } from "../services/sparse.js";
import { client as qdrant } from "../services/qdrant.js";
import { environment } from "../utils/env.js";
import costelGptTones from "./tones.js"
import type { GenAiModel } from "../types/llm.js";
import googleGenAiModel from "./llm/googleGenAiModel.js";
import ollamaGenAiModel from "./llm/ollamaGenAiModel.js";
import settings from "../config/settings.ts";

// Initialize with error handling
let llmModel: GenAiModel;
try {
  if(environment.genModel === 'google') {
    llmModel = new googleGenAiModel(environment.geminiApiKey!)
  } else if (environment.genModel === 'ollama') {
    llmModel = new ollamaGenAiModel()
  }
  console.log("✅ Gemini client initialized");
} catch (error: any) {
  console.error("❌ Failed to initialize Gemini:", error.message);
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
    
    // 2. Search Qdrant with filters
    const denseSearchResults = await qdrant.query("wiki", {
      query: queryVector,
      using: "dense",
      limit: limit * 2,
      with_payload: true,
      with_vector: false,
      score_threshold: denseScoreThreshold,
      params: {
        hnsw_ef: settings.rag.denseHnswEf
      }
    });

    // The score rule is passed in because dense and sparse scores live on
    // different scales and cannot share a single cutoff.
    const validateResults = (
      results: typeof denseSearchResults.points,
      keepScore: (score: number) => boolean
    ) => results
      .filter(r => {
        const hasText = r.payload?.text && typeof r.payload.text === 'string';
        return hasText && keepScore(r.score);
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    let filteredResults = validateResults(
      denseSearchResults.points,
      score => score >= denseScoreThreshold
    );
    console.log(`📊 Dense search found ${denseSearchResults.points.length} potential matches`);

    if (filteredResults.length === 0) {
      console.log('🔁 Dense search was not good enough; trying sparse search');
      const sparseSearchResults = await qdrant.query("wiki", {
        query: createSparseVector(question),
        using: "sparse",
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

      filteredResults = validateResults(
        sparseSearchResults.points,
        score => score >= sparseCutoff
      );
      console.log(`📊 Sparse search found ${sparseSearchResults.points.length} potential matches`);
      console.log(`   Top sparse score ${topSparseScore.toFixed(3)}, keeping ≥ ${sparseCutoff.toFixed(3)}`);
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
      console.log(`Text Preview: ${textPreview}`)
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

    const prompt = `Esti un asistent al asociatiei EESTEC (Electrical Engineering Students European Association). Numele tau este CostelGPT. Obiectivul tau este sa ajuti membrii cu informatiile de pe wiki-ul intern, la care ai acces. La nevoie poti oferi feedback sau opinii, insa doar daca esti intrebat.

CONTEXT:
${context}

INSTRUCTIUNI:
1. Raspunde DOAR folosind contextul dat
2. Este important sa raspunzi la intrebarea utilizatorului, nu devia de la subiect prea mult.
3. Raspunde factual, dar nu da raspunsuri foarte scurte. Intra in detalii daca crezi ca sunt utile.
4. Cand un utilizator intreaba de ROI, acesta face referire la Regulamentul de Ordine Interioara.
5. Nu include sursele tale in raspuns.
6. Ai fost creat de Manole Adrian. Mentioneaza acest lucru doar daca utilizatorul intreaba explicit cine te-a creat.
7. Evenimentele la care ai tu acces deja s-au intamplat. Nu vorbi cu referire la viitor.
8. Departamentul de IT exista, si este condus de VP-IT. Nu mai exista Coordonator IT, este o chestie a trecutului.
9. Foloseste un ton ${tonePrompt}

INTREBARE: ${question}

RASPUNS:`;

    // 5. Generate answer using new Gemini SDK
    const response = await llmModel.generateResponse(prompt);

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