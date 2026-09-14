from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth_schemas import GoogleLoginRequest
from app.services.auth_service import verify_google_token, get_or_create_user
from app.services.security_service import create_access_token, get_current_user, require_roles
from app.db.models import User

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/google")
def google_login(
    request: GoogleLoginRequest,
    db: Session = Depends(get_db)
):
    try:
        google_user = verify_google_token(request.credential)
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid Google token"
        )

    user = get_or_create_user(db, google_user)
    access_token = create_access_token(user.id)

    return {
        "access token": access_token,
        "id": user.id,
        "name": user.name,
        "role": user.role
    }

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "role": current_user.role
    }

@router.get("/business-only")
def business_only(
    current_user: User = Depends(
        require_roles("business", "admin")
    )
):
    return {
        "message": "Access granted",
        "user": current_user.name,
        "role": current_user.role
    }