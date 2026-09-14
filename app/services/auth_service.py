import os

from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests

from sqlalchemy.orm import Session

from app.db.models import User


load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def verify_google_token(credential: str):
    google_user = id_token.verify_oauth2_token(
        credential,
        requests.Request(),
        GOOGLE_CLIENT_ID
    )

    return google_user

def get_or_create_user(db: Session, google_user: dict):
    google_sub = google_user["sub"]

    user = (
        db.query(User)
        .filter(User.google_sub == google_sub)
        .first()
    )

    if user:
        return user

    user = User(
        google_sub=google_sub,
        name=google_user["name"],
        role="consumer"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user