from fastapi import FastAPI
from app.database import engine
from app import models

app = FastAPI(title="Nexus API")

@app.get("/health")
def health():
    return {"status": "ok"}
