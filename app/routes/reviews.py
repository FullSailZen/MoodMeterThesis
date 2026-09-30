from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.review import ReviewCreate
from app.db.database import get_db
from app.db.models import User, Review
from app.services.security_service import get_current_user

router = APIRouter(
    prefix="/reviews",
    tags=["Review"]
)


@router.post("/")
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = Review(
        business_id=review_data.business_id,
        author_id=current_user.id,
        body=review_data.body,
        rating=review_data.rating
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review