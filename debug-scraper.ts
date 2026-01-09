
import "dotenv/config";
import { fetchPageText } from "./services/scraper.js";
import { getPageContentBySearch } from "./services/wikiGraphQL.js";
import { environment } from "./utils/env.js";
import fetch from "node-fetch";

const WIKI_BASE_URL = environment.wikiBaseUrl;

async function debugScraper() {
  const path = "evenimente/externe/soft-skills-academy/ssa-4-raport-followup"; // Una din paginile cu probleme
  
  console.log("Debugging scraper for:", path);

  // Test 'list' query
  try {
      console.log("Attempting GraphQL pages.list...");
      const query = `
        query {
          pages {
            list {
              id
              path
              title
              locale
            }
          }
        }
      `;
      // We need to access fetchGraphQL. Since it's not exported, we'll import getPageContentBySearch which we don't need,
      // but actually we'll just redefine fetchGraphQL here for quick debugging.
      const TOKEN = environment.wikiJSToken!;
      const res = await fetch(WIKI_BASE_URL + "/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify({ query }),
      });
      const json:any = await res.json();
      if (json.errors) {
          console.error("List Query Errors:", json.errors[0].message);
      } else {
          console.log("List Query Success! Found", json.data.pages.list.length, "pages.");
          const target = json.data.pages.list.find((p:any) => p.path === path);
          if (target) {
              console.log("Found target page in list:", target);
          } else {
              console.log("Target page NOT found in list.");
              // Search for partial match
              const partial = json.data.pages.list.find((p:any) => p.path.includes("ssa-4"));
              if (partial) console.log("Did you mean:", partial);
          }
      }
  } catch (e) {
      console.error("List Query Failed:", e);
  }

  // Try GraphQL Search by Path
  try {
      console.log("Attempting GraphQL Search by path...");
      const content = await getPageContentBySearch(path);
      if (content) {
          console.log("✅ GraphQL Search found content! Length:", content.length);
      } else {
          console.log("❌ GraphQL Search returned empty.");
      }
  } catch (e) {
      console.error("GraphQL Search Error:", e);
  }

  console.log("Cookie present:", !!environment.wikiCookie);
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${WIKI_BASE_URL!.replace(/\/$/, '')}${normalizedPath}`;
  
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,ro;q=0.8"
  };
  
  if (environment.wikiCookie) {
    headers["Cookie"] = environment.wikiCookie;
  }

  try {
    const res = await fetch(url, { headers });
    console.log("Status:", res.status);
    
    const html = await res.text();
    console.log("HTML length:", html.length);
    console.log("HTML preview (first 500 chars):");
    console.log(html.substring(0, 500));

    // Check for specific Wiki.js state injection
    const stateMatch = html.match(/window\.__NUXT__\s*=\s*({.+});/);
    if (stateMatch) {
        console.log("Found Nuxt state!");
    } else {
        console.log("No Nuxt state found.");
    }
    
    const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    if (scripts) {
        console.log(`Found ${scripts.length} script tags.`);
        scripts.forEach((s, i) => {
            if (s.length < 500) {
                 console.log(`Script ${i}:`, s);
            } else {
                 console.log(`Script ${i}: (Length ${s.length})`);
                 // Look for "id": 123 or similar patterns
                 const idMatch = s.match(/"id":\s*(\d+)/g);
                 if (idMatch) console.log("  Potential IDs found:", idMatch.slice(0, 5));
            }
        });
    }

    // Check for selectors
    const { JSDOM } = await import("jsdom");

    const dom = new JSDOM(html);
    const article = dom.window.document.querySelector(".content, .page-content, article, #app");
    
    if (article) {
        console.log("Found selector!");
        console.log("Content length:", article.textContent?.length);
    } else {
        console.log("❌ No content selector found!");
        // List some top level classes/ids to help identify structure
        const bodyChildren = Array.from(dom.window.document.body.children);
        console.log("Body children classes/ids:", bodyChildren.map(el => `${el.tagName}#${el.id}.${Array.from(el.classList).join('.')}`));
    }
    
  } catch (err) {
    console.error(err);
  }
}

debugScraper();
