import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { environment } from "../utils/env.js";
const WIKI_BASE_URL = environment.wikiBaseUrl;
export async function fetchPageText(path) {
    const url = `${WIKI_BASE_URL}${path}`;
    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`Failed to fetch ${url}: ${res.status}`);
    const html = await res.text();
    const dom = new JSDOM(html);
    // Extract visible text from the main content container
    const article = dom.window.document.querySelector(".content, .page-content, article");
    if (!article)
        return "";
    article.querySelectorAll("script, style").forEach((el) => el.remove());
    const text = article.textContent.replace(/\s+/g, " ").trim();
    return text;
}
//# sourceMappingURL=scraper.js.map