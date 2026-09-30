from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routes.auth_routes import router as auth_router
from app.routes.reviews import router as reviews_router
from app.routes.evidence import router as evidence_router


app = FastAPI()

app.include_router(auth_router)
app.include_router(reviews_router)
app.include_router(evidence_router)

app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static"
)


@app.get("/", include_in_schema=False)
def home():
    return FileResponse("app/static/index.html")