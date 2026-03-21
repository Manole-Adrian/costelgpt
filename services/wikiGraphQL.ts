import fetch from "node-fetch";
import { environment } from "../utils/env.js";

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

  const json:any = await res.json();
  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    console.error(json.errors[0].extensions.exception)
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
    page.path.includes("asociatie/interes-general") || 
    page.path.includes("asociatie/documente-oficiale") ||
    page.path.includes("evenimente/") || 
    page.path.includes("departamente/")
)

  return filteredData
}

export async function getPageContent(path:string, locale:string, id:string) {
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


