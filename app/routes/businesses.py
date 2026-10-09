from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query
)

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Business, Review

from app.schemas.business import (
    BusinessProfileResponse,
    BusinessReviewResponse,
    BusinessReviewSummaryResponse,
    BusinessSummaryResponse
)

from app.services.review_summary_service import (
    generate_review_summary
)


router = APIRouter(
    prefix="/businesses",
    tags=["Businesses"]
)


def calculate_business_metrics(
    db: Session,
    business_id: int
):
    reviews = (
        db.query(Review)
        .filter(
            Review.business_id
            == business_id
        )
        .all()
    )

    review_count = len(
        reviews
    )

    verified_review_count = len(
        [
            review
            for review in reviews
            if review.verification_status
            == "verified"
        ]
    )

    if review_count > 0:
        average_rating = round(
            sum(
                review.rating
                for review in reviews
            )
            / review_count,
            2
        )

        verified_percentage = round(
            (
                verified_review_count
                / review_count
            )
            * 100,
            1
        )

    else:
        average_rating = None
        verified_percentage = 0.0

    return (
        reviews,
        average_rating,
        review_count,
        verified_review_count,
        verified_percentage
    )


@router.get(
    "/",
    response_model=list[
        BusinessSummaryResponse
    ]
)
def search_businesses(
    q: str | None = Query(
        default=None
    ),
    db: Session = Depends(
        get_db
    )
):
    query = db.query(
        Business
    )

    if q:
        query = query.filter(
            Business.name.ilike(
                f"%{q.strip()}%"
            )
        )

    businesses = (
        query
        .order_by(
            Business.name.asc()
        )
        .all()
    )

    results = []

    for business in businesses:

        (
            reviews,
            average_rating,
            review_count,
            verified_review_count,
            verified_percentage
        ) = calculate_business_metrics(
            db,
            business.id
        )

        results.append(
            BusinessSummaryResponse(
                id=business.id,
                name=business.name,
                address=business.address,
                city=business.city,
                state=business.state,
                average_rating=(
                    average_rating
                ),
                review_count=(
                    review_count
                ),
                verified_review_count=(
                    verified_review_count
                ),
                verified_percentage=(
                    verified_percentage
                )
            )
        )

    return results


@router.get(
    "/{business_id}/summary",
    response_model=(
        BusinessReviewSummaryResponse
    )
)
def get_business_review_summary(
    business_id: int,
    db: Session = Depends(
        get_db
    )
):
    business = (
        db.query(Business)
        .filter(
            Business.id
            == business_id
        )
        .first()
    )

    if not business:
        raise HTTPException(
            status_code=404,
            detail="Business not found."
        )

    reviews = (
        db.query(Review)
        .filter(
            Review.business_id
            == business_id
        )
        .order_by(
            Review.created_at.desc()
        )
        .all()
    )

    review_data = []

    for review in reviews:
        review_data.append(
            {
                "rating":
                    review.rating,

                "body":
                    review.body,

                "verification_status":
                    review.verification_status
            }
        )

    try:
        return generate_review_summary(
            business_name=business.name,
            reviews=review_data
        )

    except Exception as error:
        print(
            "Review summary error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "MoodMeter could not generate "
                "the review summary."
            )
        )


@router.get(
    "/{business_id}",
    response_model=(
        BusinessProfileResponse
    )
)
def get_business(
    business_id: int,
    db: Session = Depends(
        get_db
    )
):
    business = (
        db.query(Business)
        .filter(
            Business.id
            == business_id
        )
        .first()
    )

    if not business:
        raise HTTPException(
            status_code=404,
            detail="Business not found."
        )

    (
        reviews,
        average_rating,
        review_count,
        verified_review_count,
        verified_percentage
    ) = calculate_business_metrics(
        db,
        business.id
    )

    review_results = []

    for review in sorted(
        reviews,
        key=lambda item:
            item.created_at,
        reverse=True
    ):
        review_results.append(
            BusinessReviewResponse(
                id=review.id,
                rating=review.rating,
                body=review.body,
                verification_status=(
                    review.verification_status
                ),
                created_at=(
                    review.created_at
                )
            )
        )

    return BusinessProfileResponse(
        id=business.id,
        name=business.name,
        address=business.address,
        city=business.city,
        state=business.state,
        average_rating=(
            average_rating
        ),
        review_count=(
            review_count
        ),
        verified_review_count=(
            verified_review_count
        ),
        verified_percentage=(
            verified_percentage
        ),
        reviews=review_results
    )