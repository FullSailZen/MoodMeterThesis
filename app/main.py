from pathlib import Path

from fastapi import FastAPI

from fastapi.responses import (
    HTMLResponse
)

from fastapi.staticfiles import (
    StaticFiles
)

from app.routes.auth_routes import (
    router as auth_router
)

from app.routes.reviews import (
    router as reviews_router
)

from app.routes.evidence import (
    router as evidence_router
)

from app.routes.businesses import (
    router as businesses_router
)

from app.routes.users import (
    router as users_router
)

from app.routes.semantic_retrieval import (
    router as semantic_retrieval_router
)

from app.routes.external_api import (
    router as external_api_router
)


APP_ROOT = Path(__file__).resolve().parent
STATIC_ROOT = APP_ROOT / "static"


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

app.include_router(
    semantic_retrieval_router
)

app.include_router(
    external_api_router
)


app.mount(
    "/static",
    StaticFiles(
        directory=str(
            STATIC_ROOT
        )
    ),
    name="static"
)


def serve_page(
    filename: str
) -> HTMLResponse:

    file_path = (
        STATIC_ROOT
        / filename
    )

    html = (
        file_path
        .read_text(
            encoding="utf-8"
        )
    )

    theme_script = (
        '<script src="/static/theme.js?v=1">'
        "</script>"
    )

    if theme_script not in html:
        html = html.replace(
            "</body>",
            f"{theme_script}\n</body>"
        )

    return HTMLResponse(
        content=html
    )


@app.get(
    "/health",
    include_in_schema=False
)
def health():
    return {
        "status": "ok"
    }


@app.get(
    "/",
    include_in_schema=False
)
def home():
    return serve_page(
        "index.html"
    )


@app.get(
    "/businesses-page",
    include_in_schema=False
)
def businesses_page():
    return serve_page(
        "businesses.html"
    )


@app.get(
    "/review-page",
    include_in_schema=False
)
def review_page():
    return serve_page(
        "review_detail.html"
    )


@app.get(
    "/account",
    include_in_schema=False
)
def account_page():
    return serve_page(
        "account.html"
    )


@app.get(
    "/reviewer-profile",
    include_in_schema=False
)
def reviewer_profile_page():
    return serve_page(
        "reviewer_profile.html"
    )