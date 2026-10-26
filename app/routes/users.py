from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.db.models import (
    Business,
    Review,
    User
)

from app.schemas.user import (
    PublicUserProfileResponse,
    PublicUserReviewResponse,
    UserProfileResponse,
    UserReviewResponse
)

from app.services.security_service import (
    get_current_user
)


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


PUBLIC_REVIEW_STATUSES = (
    "verified",
    "unverified"
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

    total_reviews = len(
        reviews
    )

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
        email=current_user.email,
        role=current_user.role,
        created_at=current_user.created_at,
        auth_provider=auth_provider,
        total_reviews=total_reviews,
        verified_reviews=verified_reviews,
        unverified_reviews=unverified_reviews,
        average_rating=average_rating,
        reviews=reviews
    )


@router.get(
    "/{user_id}/profile",
    response_model=PublicUserProfileResponse
)
def get_public_user_profile(
    user_id: int,
    db: Session = Depends(
        get_db
    )
):
    user = (
        db.query(
            User
        )
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Reviewer not found"
        )

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
            == user.id,
            Review.verification_status.in_(
                PUBLIC_REVIEW_STATUSES
            )
        )
        .order_by(
            Review.created_at.desc()
        )
        .all()
    )

    reviews = []

    for review, business in rows:
        reviews.append(
            PublicUserReviewResponse(
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

    total_reviews = len(
        reviews
    )

    verified_reviews = len(
        [
            review
            for review in reviews
            if review.verification_status
            == "verified"
        ]
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

    return PublicUserProfileResponse(
        id=user.id,
        name=user.name,
        role=user.role,
        created_at=user.created_at,
        total_reviews=total_reviews,
        verified_reviews=verified_reviews,
        average_rating=average_rating,
        reviews=reviews
    )