from fastapi import FastAPI
from transformers import pipeline
from pydantic import BaseModel
import numpy as np

app = FastAPI()
pipe = pipeline("feature-extraction", model="readerbench/RoBERT-base")

class Document(BaseModel):
    text: str

@app.post("/predict")
def predict(doc: Document):

    raw_output = pipe(doc.text, truncation=True, max_length=768)

    token_embeddings = raw_output[0]

    document_embedding = np.mean(token_embeddings, axis=0).tolist()

    return {"embedding": document_embedding}