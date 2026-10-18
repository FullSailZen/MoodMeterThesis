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


app.mount(
    "/static",
    StaticFiles(
        directory="app/static"
    ),
    name="static"
)


def serve_page(
    file_path: str
) -> HTMLResponse:

    html = (
        Path(
            file_path
        )
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
    "/",
    include_in_schema=False
)
def home():
    return serve_page(
        "app/static/index.html"
    )


@app.get(
    "/businesses-page",
    include_in_schema=False
)
def businesses_page():
    return serve_page(
        "app/static/businesses.html"
    )


@app.get(
    "/review-page",
    include_in_schema=False
)
def review_page():
    return serve_page(
        "app/static/review_detail.html"
    )


@app.get(
    "/account",
    include_in_schema=False
)
def account_page():
    return serve_page(
        "app/static/account.html"
    )