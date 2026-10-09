from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Business, Review, User
from app.schemas.user import (
    UserProfileResponse,
    UserReviewResponse
)
from app.services.security_service import get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get(
    "/me/profile",
    response_model=UserProfileResponse
)
def get_my_profile(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    )
):
    rows = (
        db.query(
            Review,
            Business
        )
        .join(
            Business,
            Review.business_id
            == Business.id
        )
        .filter(
            Review.author_id
            == current_user.id
        )
        .order_by(
            Review.created_at.desc()
        )
        .all()
    )

    reviews = []

    for review, business in rows:
        reviews.append(
            UserReviewResponse(
                id=review.id,
                business_id=business.id,
                business_name=business.name,
                business_city=business.city,
                business_state=business.state,
                rating=review.rating,
                body=review.body,
                verification_status=(
                    review.verification_status
                ),
                created_at=review.created_at
            )
        )

    total_reviews = len(reviews)

    verified_reviews = len(
        [
            review
            for review in reviews
            if review.verification_status
            == "verified"
        ]
    )

    unverified_reviews = (
        total_reviews
        - verified_reviews
    )

    if total_reviews > 0:
        average_rating = round(
            sum(
                review.rating
                for review in reviews
            )
            / total_reviews,
            2
        )
    else:
        average_rating = None

    auth_provider = (
        "Google"
        if current_user.google_sub
        else "MoodMeter"
    )

    return UserProfileResponse(
        id=current_user.id,
        name=current_user.name,
        role=current_user.role,
        created_at=current_user.created_at,
        auth_provider=auth_provider,
        total_reviews=total_reviews,
        verified_reviews=verified_reviews,
        unverified_reviews=unverified_reviews,
        average_rating=average_rating,
        reviews=reviews
    )