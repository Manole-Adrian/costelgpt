import "dotenv/config";
import { embedText } from "../services/embeddings.js";
import { client as qdrant } from "../services/qdrant.js";
import { environment } from "../utils/env.js";
import costelGptTones from "./tones.js";
import googleGenAiModel from "./llm/googleGenAiModel.js";
import ollamaGenAiModel from "./llm/ollamaGenAiModel.js";
// Initialize with error handling
let llmModel;
try {
    if (environment.genModel === 'google') {
        llmModel = new googleGenAiModel(environment.geminiApiKey);
    }
    else if (environment.genModel === 'ollama') {
        llmModel = new ollamaGenAiModel();
    }
    console.log("✅ Gemini client initialized");
    console.log(`☁ QDrant Cluster: ${environment.qdrantClusterEndpoint}`)
}
catch (error) {
    console.error("❌ Failed to initialize Gemini:", error.message);
    process.exit(1);
}
export async function ragQuery(question, tone, options = {}) {
    var _a, _b, _c, _d;
    const limit = 4;
    const scoreThreshold = 0.7;
    const maxContextLength = 6000;
    try {
        console.log(`🔍 Processing question: "${question}"`);
        // 1. Generate query embedding
        const queryVector = await embedText(question);
        // 2. Search Qdrant with filters
        const searchResults = await qdrant.search("wiki", {
            vector: queryVector,
            limit: limit * 2,
            with_payload: true,
            with_vector: false,
            score_threshold: scoreThreshold,
        });
        console.log(`📊 Found ${searchResults.length} potential matches`);
        if (searchResults.length === 0) {
            return {
                answer: "I couldn't find relevant information to answer your question.",
                sources: [],
                scores: [],
                confidence: 0
            };
        }
        // Debug what's in the payload
        console.log("Sample payload structure:");
        searchResults.slice(0, 2).forEach((result, i) => {
            console.log(`  Result ${i + 1}:`, Object.keys(result.payload || {}));
        });
        // Filter and validate results have text
        const filteredResults = searchResults
            .filter(r => {
            var _a;
            const hasText = ((_a = r.payload) === null || _a === void 0 ? void 0 : _a.text) && typeof r.payload.text === 'string';
            const hasScore = r.score >= scoreThreshold;
            return hasText && hasScore;
        })
            .slice(0, limit)
            .sort((a, b) => b.score - a.score);
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
            const text = ((_a = result.payload) === null || _a === void 0 ? void 0 : _a.text) || "No text content available";
            const sourceText = `[Source ${index + 1} - Score: ${result.score.toFixed(3)}]\n${text}`;
            if (context.length + sourceText.length > maxContextLength) {
                console.log(`⚠️ Stopping at source ${index + 1} due to context limit`);
                break;
            }
            context += sourceText + "\n\n";
            sources.push({
                index: index + 1,
                score: result.score,
                title: ((_b = result.payload) === null || _b === void 0 ? void 0 : _b.title) || 'Unknown',
                path: ((_c = result.payload) === null || _c === void 0 ? void 0 : _c.path) || 'Unknown',
                chunkIndex: ((_d = result.payload) === null || _d === void 0 ? void 0 : _d.chunkIndex) || 0,
                textPreview: text.substring(0, Math.min(150, text.length)) + (text.length > 150 ? '...' : '')
            });
        }
        console.log(`📚 Using ${sources.length} sources for context`);
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
        const tonePrompt = costelGptTones[tone];
        const prompt = `Esti un asistent al asociatiei EESTEC (Electrical Engineering Students European Association). Numele tau este CostelGPT si ai fost creat de Manole Adrian. Obiectivul tau este sa ajuti membrii cu informatiile de pe wiki-ul intern, la care ai acces. La nevoie poti oferi feedback sau opinii, insa doar daca esti intrebat.

CONTEXT:
${context}

INSTRUCTIUNI:
1. Raspunde DOAR folosind contextul dat
2. Este important sa raspunzi la intrebarea utilizatorului, nu devia de la subiect prea mult.
3. Raspunde factual, dar nu da raspunsuri foarte scurte. Intra in detalii daca crezi ca sunt utile.
4. Cand un utilizator intreaba de ROI, acesta face referire la Regulamentul de Ordine Interioara.
5. Nu include sursele tale in raspuns.
6. Nu include cine te-a creat decat daca esti intrebat
7. Evenimentele la care ai tu acces deja s-au intamplat. Nu vorbi cu referire la viitor.
8. Departamentul de IT exista, si este condus de VP-IT. Nu mai exista Coordonator IT, este o chestie a trecutului.
9. Foloseste un ton ${tonePrompt}

INTREBARE: ${question}

RASPUNS:`;
        // 5. Generate answer using new Gemini SDK
        const response = await llmModel.generateResponse(prompt);
        const answer = response.text;
        if (!filteredResults[0]) {
            throw Error("No results");
        }
        return {
            answer,
            sources,
            scores: filteredResults.map(r => r.score),
            confidence: filteredResults.length > 0 ? filteredResults[0].score : 0,
            totalSources: filteredResults.length
        };
    }
    catch (error) {
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
// CLI interface
// async function main() {
//   const args = process.argv.slice(2);
//   if (args.length === 0) {
//     console.log("❌ No arguments provided!");
//     console.log("\nUsage:");
//     console.log('  node search.js "Your question here"');
//     console.log("  node search.js --test");
//     console.log("  node search.js --model gemini-2.0-flash-exp \"Your question\"");
//     console.log("\nExample:");
//     console.log('  node search.js "Ce este ICE?"');
//     return;
//   }
//   // Parse model flag if present
//   let modelName = "gemini-2.5-flash";
//   let questionArgs = args;
//   const modelIndex = args.indexOf("--model");
//   if (modelIndex !== -1 && args.length > modelIndex + 1) {
//     modelName = args[modelIndex + 1]!;
//     questionArgs = args.filter((_, idx) => idx !== modelIndex && idx !== modelIndex + 1);
//   }
//   const question = questionArgs.join(" ");
//   console.log(`🤖 Asking: "${question}"`);
//   console.log(`🤖 Using model: ${modelName}`);
//   const result = await ragQuery(question, 'Normal', { modelName });
//   console.log("\n" + "=".repeat(60));
//   console.log("ANSWER:");
//   console.log("=".repeat(60));
//   console.log(result.answer);
//   console.log("\n" + "=".repeat(60));
//   if (result.sources.length > 0) {
//     console.log("\n📚 SOURCES:");
//     result.sources.forEach(source => {
//       console.log(`[${source.index}] ${source.title} (Score: ${source.score.toFixed(3)})`);
//       console.log(`   Path: ${source.path}`);
//       if (source.textPreview) {
//         console.log(`   Preview: ${source.textPreview}`);
//       }
//     });
//   }
//   console.log(`\n📊 Confidence: ${result.confidence.toFixed(3)}`);
//   console.log(`🔗 Sources used: ${result.totalSources}`);
// }
// // THIS IS WHAT MAKES IT RUN
// main().catch(error => {
//   console.error("💥 Fatal error:", error);
//   process.exit(1);
// });
//# sourceMappingURL=search.js.map