from app.routes.auth_routes import router as auth_router
from fastapi import FastAPI
from app.routes.evidence import router as evidence_router

app = FastAPI()


app.include_router(auth_router)
app.include_router(evidence_router)