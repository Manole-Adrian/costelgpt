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
| LLM_API_KEY             |             | LLM API key                              |                                  |
| QDRANT_URL              |             | Pentru rulat qdrant local, URL-ul        |                                  |
| WIKI_BASE_URL           |             | URL-ul wiki-ului                         | `https://wiki.eestec.ro/`        |
| QDRANT_API_KEY          |             | Pentru rulat qdrant in cloud, API key    |                                  |
| QDRANT_CLUSTER_ENDPOINT |             | Pentru rulat qdrant in cloud, endpointul |                                  |
| BACKEND_PORT            |             | Portul serverului                        | `3000`                           |
| AUTH_DEV_BYPASS         |             | Oprirea autentificarii pt development    | `false`                          |
| FIREBASE_PROJECT_ID     |             | ID-ul proiectului pe firebase            | `costel-676d9`                   |

In path-ul `/config/settings.ts` puteti gasi majoritatea celorlalte campuri care pot fi editate. Orice alt 'magic string' sau 'magic number' care totusi ar putea fi modificat in viitor ar trebui pus aici, si nu in varful filei.

## Ingerare

Ingerarea se poate executa ruland fila `ingest.ts`. Aceasta primeste unul din trei parametri. `--all`, `--markdown`, `--wiki-only`

Datorita versiunii specifice de wiki folosita de EESTEC, unele pagini nu pot fi procesate automat prin graphQL. Alternativa pentru asta ar fi un scraper custom, ceea ce a depasit resursele mele. Asadar, paginile considerate importante care nu pot fi procesate automat prin graphQL sunt downloadate si puse in markdown. Argumentul `--markdown` ingereaza doar filele markdown, `--wiki-only` doar paginile de wiki, iar `--all` pe toate.

In cazul modificarii modelului de generat embeddings, daca embeddingurile generate au un token size diferit fata de cel anterior, colectia din qdrant este stearsa. In rest, stergerea colectiei se face manual.

Momentan sunt ingerate doar paginile din `interes-general`, `departamente` si `evenimente`

## Research

In timp ce lucram la munca (si prin extensie, la un sistem similar cu acesta), a trebuit sa fac niste research. Mie mi s-au parut utile acestea, poate vi se par si voua:

https://arxiv.org/pdf/2407.01219
https://www.researchgate.net/publication/389140490_A_Research_of_Challenges_and_Solutions_in_Retrieval_Augmented_Generation_RAG_Systems
https://arxiv.org/pdf/2201.10005

Daca sunt orice fel de curiozitati sau intrebari, nu ezitati sa ma contactati prin email (adrian.manole@eestec.ro) sau alte metode la care aveti acces!
