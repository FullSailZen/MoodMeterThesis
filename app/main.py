from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routes.auth_routes import router as auth_router
from app.routes.reviews import router as reviews_router
from app.routes.evidence import router as evidence_router
from app.routes.businesses import router as businesses_router
from app.routes.users import router as users_router


app = FastAPI()


app.include_router(
    auth_router
)

app.include_router(
    reviews_router
)

app.include_router(
    evidence_router
)

app.include_router(
    businesses_router
)

app.include_router(
    users_router
)


app.mount(
    "/static",
    StaticFiles(
        directory="app/static"
    ),
    name="static"
)


@app.get(
    "/",
    include_in_schema=False
)
def home():
    return FileResponse(
        "app/static/index.html"
    )


@app.get(
    "/businesses-page",
    include_in_schema=False
)
def businesses_page():
    return FileResponse(
        "app/static/businesses.html"
    )


@app.get(
    "/account",
    include_in_schema=False
)
def account_page():
    return FileResponse(
        "app/static/account.html"
    )