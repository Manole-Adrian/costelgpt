# CostelGPT

## Instalare si Rulare

Versiune node: 22.15

Pentru a instala dependintele, ruleaza `npm install`

Pentru a rula proiectul, ruleaza `npm run start`

Pentru a rula serviciul de ingerare, ruleaza `npm run ingest`

## Configurare

In repo exista o fila `.example.env`, aceasta trebuie copiata, redenumind copia in `.env`

| Nume cheie              | Obligatoriu | Descriere                                | Valoare Implicita                |
| ----------------------- | :---------: | ---------------------------------------- | -------------------------------- |
| WIKI_URL                |             | URL-ul GraphQL                           | `https://wiki.eestec.ro/graphql` |
| WIKIJSTOKEN             |     \*      | wiki API token                           |                                  |
| GEMINI_API_KEY          |             | API key gemini                           |                                  |
| QDRANT_URL              |             | Pentru rulat qdrant local, URL-ul        |                                  |
| WIKI_BASE_URL           |             | URL-ul wiki-ului                         | `https://wiki.eestec.ro/`        |
| QDRANT_API_KEY          |             | Pentru rulat qdrant in cloud, API key    |                                  |
| QDRANT_CLUSTER_ENDPOINT |             | Pentru rulat qdrant in cloud, endpointul |                                  |
| BACKEND_PORT            |             | Portul serverului                        | `3000`                           |
| GEN_MODEL               |             | Ce model sa foloseasca LLM-ul            | `google`                         |

## Ingerare

Ingerarea se poate executa ruland fila `ingest.ts`. Aceasta primeste unul din trei parametri. `--all`, `--markdown`, `--wiki-only`

Datorita versiunii specifice de wiki folosita de EESTEC, unele pagini nu pot fi procesate automat prin graphQL. Alternativa pentru asta ar fi un scraper custom, ceea ce a depasit resursele mele. Asadar, paginile considerate importante care nu pot fi procesate automat prin graphQL sunt downloadate si puse in markdown. Argumentul `--markdown` ingereaza doar filele markdown, `--wiki-only` doar paginile de wiki, iar `--all` pe toate.

In cazul modificarii modelului de generat embeddings, daca embeddingurile generate au un token size diferit fata de cel anterior, colectia din qdrant este stearsa. In rest, stergerea colectiei se face manual.

Momentan sunt ingerate doar paginile din `interes-general`, `departamente` si `evenimente`
