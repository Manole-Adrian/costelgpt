# CostelGPT

## Instalare si Rulare

Versiune node: 22.15

Pentru a instala dependintele, ruleaza `npm install`

Pentru a rula proiectul, ruleaza `npm run start`

Pentru a rula serviciul de ingerare, ruleaza `npm run ingest`

## Configurare

In repo exista o fila `.example.env`, aceasta trebuie copiata, redenumind copia in `.env`

WIKI_URL : URL-ul graphql al wiki-ului. Foloseste-l pe cel dat decat daca se schimba URL-ul. Obligatoriu
WIKIJSTOKEN : API tokenul de pe wiki. Asigura-te ca ai permisiunile necesare. Obligatoriu.
GEMINI_API_KEY : In cazul folosirii unui LLM google, este nevoie de aceasta cheie.
QDRANT_URL : In cazul in care Qdrant este rulat local, este necesar acest URL
WIKI_BASE_URL : URL-ul wiki-ului. Obligatoriu
QDRANT_API_KEY : In cazul in care Qdrant este rulat in cloud, este necesar acest API key
QDRANT_CLUSTER_ENDPOINT : In cazul in care Qdrant este rulat in cloud, este nevoie de acest endpoint
BACKEND_PORT : Portul pe care sa ruleze serverul
GEN_MODEL : Ce model sa fie folosit. Momentan optiunile sunt `google` si `ollama`

## Ingerare

Ingerarea se poate executa ruland fila `ingest.ts`. Aceasta primeste unul din trei parametri. `--all`, `--markdown`, `--wiki-only`

Datorita versiunii specifice de wiki folosita de EESTEC, unele pagini nu pot fi procesate automat prin graphQL. Alternativa pentru asta ar fi un scraper custom, ceea ce a depasit resursele mele. Asadar, paginile considerate importante care nu pot fi procesate automat prin graphQL sunt downloadate si puse in markdown. Argumentul `--markdown` ingereaza doar filele markdown, `--wiki-only` doar paginile de wiki, iar `--all` pe toate.

In cazul modificarii modelului de generat embeddings, daca embeddingurile generate au un token size diferit fata de cel anterior, colectia din qdrant este stearsa. In rest, stergerea colectiei se face manual.

Momentan sunt ingerate doar paginile din `interes-general`, `departamente` si `evenimente`
