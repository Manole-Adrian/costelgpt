
// Auth
const ALLOWED_EMAIL_DOMAIN = "@eestec.ro"

// Qdrant
const COLLECTION_NAME = 'wiki';
const DENSE_VECTOR_NAME = 'dense';
const DENSE_VECTOR_MODIFIER = 'Cosine';
const SPARSE_VECTOR_NAME = 'sparse';
const SPARSE_VECTOR_MODIFIER = 'idf'

// Ingestion (wiki graph ql)
const ALLOWED_WIKI_INGESTION_PATHS = ["asociatie/interes-general","asociatie/documente-oficiale","evenimente/","departamente/"]

export { ALLOWED_EMAIL_DOMAIN, COLLECTION_NAME, DENSE_VECTOR_NAME, SPARSE_VECTOR_NAME, DENSE_VECTOR_MODIFIER, SPARSE_VECTOR_MODIFIER, ALLOWED_WIKI_INGESTION_PATHS }