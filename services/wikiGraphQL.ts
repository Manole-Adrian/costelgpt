import fetch from "node-fetch";
import { environment } from "../config/env.js";
import { ALLOWED_WIKI_INGESTION_PATHS } from "./constants.js";

const API_URL = environment.wikiUrl!;
const TOKEN = environment.wikiJSToken!;

async function fetchGraphQL(query: string, variables = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`GraphQL request failed: ${res.status} ${res.statusText}`);
    if (body) console.error(body.slice(0, 500));
    return null;
  }

  let json: any;
  try {
    json = await res.json();
  } catch (error: any) {
    console.error("GraphQL response was not valid JSON:", error.message);
    return null;
  }

  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    const exception = json.errors[0]?.extensions?.exception;
    if (exception) console.error(exception);
    return null;
  }
  return json.data;
}

export async function getAllWikiPages() {
  const query = `
    query AllPages {
      pages {
         list {
          id
          title
          path
          locale
        }
      }
    }
  `;

  const data = await fetchGraphQL(query);
  if (!data) return [];
  const filteredData = data.pages.list.filter((page:any) => 
    ALLOWED_WIKI_INGESTION_PATHS.some(allowedPath => page.path.includes(allowedPath))
    
)

  return filteredData
}

export async function getPageContent(id:string) {
  const query = `
    query SinglePage($intId: Int!) {
      pages {
        single(id: $intId) {
          id
          content
        }
      }
    }
  `;
  const intId = parseInt(id)
  const data = await fetchGraphQL(query, { intId });
  return data?.pages?.single?.content || "";
}

export async function getPageContentBySearch(pathFragment: string) {
  const query = `
    query($query: String!) {
      pages {
        search(query: $query) {
          results {
            id
            content
          }
        }
      }
    }
  `;
  const data = await fetchGraphQL(query, { query: pathFragment });
  return data?.pages?.search?.results[0]?.content || "";
}


