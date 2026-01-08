import "dotenv/config";
import { getAllWikiPages, getPageContent, getPageContentBySearch } from "./services/wikiGraphQL.js";
import { chunkText } from "./services/chunker.js";
import { embedText } from "./services/embeddings.js";
import { ensureCollection, client as qdrant } from "./services/qdrant.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function debugVector(vector:any[], chunkIndex: number) {
  if (chunkIndex === 0) {
    console.log(`🔍 Vector debug - Length: ${vector.length}`);
    console.log(`   First 3 values: [${vector.slice(0, 3).map(v => v.toFixed(6)).join(', ')}]`);
    console.log(`   Type check: ${vector.slice(0, 3).map(v => typeof v).join(', ')}`);
  }
}

async function ingestFromMarkdown(folderPath = "./sources") {
  console.log(`📂 Ingesting markdown files from: ${folderPath}`);
  
  const fullPath = path.join(__dirname, folderPath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Folder not found: ${fullPath}`);
    return 0;
  }
  

  const files = fs.readdirSync(fullPath)
    .filter(file => file.endsWith('.md') || file.endsWith('.markdown'))
    .map(file => path.join(fullPath, file));
  
  console.log(`📄 Found ${files.length} markdown files`);
  
  let totalChunks = 0;
  let nextId = 1000000;
  
  for (const filePath of files) {
    try {
      console.log(`\n📄 Processing: ${path.basename(filePath)}`);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      
      const title = extractTitle(filePath, content);
      
      const chunks = chunkText(content);
      console.log(`   ✂️ Split into ${chunks.length} chunks`);
      
      for (let i = 0; i < chunks.length; i++) {
        try {
          console.log(`   🔧 Processing chunk ${i+1}/${chunks.length}...`);
          
          const vector = await embedText(chunks[i]!);
          
          const pointId = nextId++;
          
          const point = {
            id: pointId,
            vector: vector,
            payload: {
              pageId: -1,
              title: title,
              path: `markdown://${path.basename(filePath)}`,
              chunkIndex: i,
              totalChunks: chunks.length,
              text: chunks[i],
              textPreview: chunks[i]!.substring(0, 150) + '...',
              sourceType: 'markdown',
              filePath: filePath,
              originalCompositeId: `md-${path.basename(filePath)}-${i}`
            }
          };
          
          await qdrant.upsert("wiki", {
            wait: true,
            points: [point]
          });
          
          totalChunks++;
          
        } catch (error: any) {
          console.error(`   ❌ Failed chunk ${i+1}:`, error.message);
          continue;
        }
      }
      
    } catch (error: any) {
      console.error(`❌ Failed to process ${filePath}:`, error.message);
    }
  }
  
  console.log(`\n✅ Markdown ingestion complete!`);
  console.log(`   Added ${totalChunks} chunks from ${files.length} files`);
  return totalChunks;
}

function extractTitle(filePath: string, content: string) {
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1]!.trim();
  }
  
  return path.basename(filePath, path.extname(filePath))
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

async function ingest() {
  console.log("🔍 Fetching all Wiki.js pages...");
  const pages = await getAllWikiPages();
  console.log("📦 Ensuring Qdrant collection exists...");
  await ensureCollection();

  console.log(`🚀 Ingesting ${pages.length} pages into Qdrant...`);

  let nextId = 1;
  
  function generateId(pageId: number, chunkIndex: number) {
    return pageId * 10000 + chunkIndex;
  }

  const content = await getPageContentBySearch("regulament-de-ordine-interioara");

  for (const page of pages) {
    console.log(`\n📄 Processing: ${page.title} (ID: ${page.id})`);
    
    const content = await getPageContent(page.path, page.locale || "en", page.id);
    if (!content) {
      console.log(`   ⚠️ No content, skipping`);
      continue;
    }

    const chunks = chunkText(content);
    // console.log(`   ✂️ Split into ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      try {
        console.log(`   🔧 Processing chunk ${i+1}/${chunks.length}...`);
        
        const vector = await embedText(chunks[i]!);
        
        debugVector(vector, i);
        
        if (!isValidVector(vector)) {
          throw new Error('Invalid embedding vector generated');
        }
        
        const pointId = generateId(page.id, i);
        
        // Prepare the point
        const point = {
          id: pointId,
          vector: vector,
          payload: {
            pageId: page.id,
            title: page.title,
            path: page.path,
            chunkIndex: i,
            totalChunks: chunks.length,
            text: chunks[i], // entire text
            textPreview: chunks[i]!.substring(0, 150) + '...', // preview
            originalCompositeId: `${page.id}-${i}` 
          }
        };
        
        // console.log(`Uploading (ID: ${pointId})...`);
        await qdrant.upsert("wiki", {
          wait: true, // Wait for confirmation
          points: [point]
        });
        
        // console.log(` Chunk ${i+1} ingested successfully`);
        
      } catch (error: any) {
        console.error(`   ❌ Failed chunk ${i+1}:`, error.message);
        if (error.data?.status?.error) {
          console.error(`   Qdrant error:`, error.data.status.error);
        }
        // Continue with next chunk instead of stopping
        continue;
      }
    }
  }

  console.log(`\n🎉 Ingestion complete!`);
}

function isValidVector(vector: any[]) {
  if (!Array.isArray(vector)) return false;
  if (vector.some(v => typeof v !== 'number' || isNaN(v))) return false;
  return true;
}

// Add this at the end of your file, replacing the ingest() call
async function main() {
  const args = process.argv.slice(2);
  
  console.log("WikiJS + Markdown Ingestor");
  console.log("=".repeat(40));
  
  if (args.includes("--markdown") || args.includes("-m")) {
    // Ingest only markdown
    await ensureCollection();
    await ingestFromMarkdown();
  } else if (args.includes("--all") || args.includes("-a")) {
    // Ingest both Wiki and markdown
    await ensureCollection();
    await ingest();
    await ingestFromMarkdown();
  } else if (args.includes("--wiki-only") || args.includes("-w")) {
    // Ingest only Wiki
    await ingest();
  } else {
    // Default: ask what to do
    console.log("\nUsage:");
    console.log("  node index.js --wiki-only    # Ingest only Wiki.js pages");
    console.log("  node index.js --markdown     # Ingest only markdown files");
    console.log("  node index.js --all          # Ingest both sources");
    console.log("\nExamples:");
    console.log("  node index.js --all");
    console.log("  node index.js --markdown");
  }
}

main().catch(console.error);