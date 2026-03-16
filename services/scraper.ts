import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { environment } from "../utils/env.js";

const WIKI_BASE_URL = environment.wikiBaseUrl;

export async function fetchPageText(path: string) {
  if (!WIKI_BASE_URL) {
    throw new Error("WIKI_BASE_URL is not configured in environment variables.");
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${WIKI_BASE_URL.replace(/\/$/, '')}${normalizedPath}`;
  
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,ro;q=0.8"
  };
  
  if (environment.wikiCookie) {
    headers["Cookie"] = environment.wikiCookie;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

  const html = await res.text();
  const dom = new JSDOM(html);

  const article = dom.window.document.querySelector(".content, .page-content, article");
  if (!article) return "";

  article.querySelectorAll("script, style").forEach((el: any) => el.remove());

  const text = article.textContent.replace(/\s+/g, " ").trim();
  return text;
}
