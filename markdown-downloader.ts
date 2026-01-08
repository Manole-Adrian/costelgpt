import 'dotenv/config';
import fetch from "node-fetch";
import { getAllWikiPages } from "./services/wikiGraphQL.js";
import { environment } from './utils/env.js';

const API_URL = environment.wikiBaseUrl; 
const TOKEN = environment.wikiJSToken;

export async function getPageMarkdown(id: string) {
  if (!API_URL) throw new Error("WIKI_BASE_URL is not set!");
  const url = `${API_URL}/api/pages/${id}/raw`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  if (!res.ok) {
    console.warn(`Failed to fetch page ${id}`);
    console.log(res)
    return null;
  }

  return await res.text();
}

async function main() {
  const pages = await getAllWikiPages();

  for (const page of pages) {
    const markdown = await getPageMarkdown(page.id);
    console.log(page.path, markdown?.slice(0, 100)); // sample
  }
}

main();
