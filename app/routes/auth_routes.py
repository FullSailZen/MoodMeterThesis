import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.services.auth_service import (
    get_or_create_user,
    verify_google_token
)
from app.services.security_service import (
    create_access_token,
    get_current_user,
    require_roles
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


class GoogleLoginRequest(BaseModel):
    credential: str


@router.get("/config")
def get_auth_config():
    google_client_id = os.getenv(
        "GOOGLE_CLIENT_ID"
    )

    if not google_client_id:
        raise HTTPException(
            status_code=500,
            detail=(
                "GOOGLE_CLIENT_ID is not configured."
            )
        )

    return {
        "google_client_id":
            google_client_id
    }


@router.post("/google")
def google_login(
    request: GoogleLoginRequest,
    db: Session = Depends(get_db)
):
    google_user = verify_google_token(
        request.credential
    )

    user = get_or_create_user(
        db=db,
        google_user=google_user
    )

    access_token = create_access_token(
        user.id
    )

    return {
        "access_token":
            access_token,
        "token_type":
            "bearer",
        "user": {
            "id":
                user.id,
            "name":
                user.name,
            "role":
                user.role
        }
    }


@router.get("/me")
def get_me(
    current_user: User = Depends(
        get_current_user
    )
):
    return {
        "id":
            current_user.id,
        "name":
            current_user.name,
        "role":
            current_user.role
    }


@router.get("/business-only")
def business_only(
    current_user: User = Depends(
        require_roles(
            "business",
            "admin"
        )
    )
):
    return {
        "message":
            "Business access granted.",
        "user_id":
            current_user.id
    }


@router.get("/admin-only")
def admin_only(
    current_user: User = Depends(
        require_roles(
            "admin"
        )
    )
):
    return {
        "message":
            "Admin access granted.",
        "user_id":
            current_user.id
    }