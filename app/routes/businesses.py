from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query
)

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Business, Review

from app.schemas.business import (
    BusinessProfileResponse,
    BusinessReviewResponse,
    BusinessSummaryResponse
)


router = APIRouter(
    prefix="/businesses",
    tags=["Businesses"]
)


def calculate_business_metrics(
    reviews: list[Review]
) -> dict:
    review_count = len(reviews)

    if review_count == 0:
        return {
            "average_rating": None,
            "review_count": 0,
            "verified_review_count": 0,
            "verified_percentage": 0.0
        }

    rating_total = sum(
        review.rating
        for review in reviews
    )

    average_rating = round(
        rating_total / review_count,
        2
    )

    verified_review_count = sum(
        1
        for review in reviews
        if review.verification_status == "verified"
    )

    verified_percentage = round(
        (
            verified_review_count
            / review_count
        ) * 100,
        1
    )

    return {
        "average_rating": average_rating,
        "review_count": review_count,
        "verified_review_count": verified_review_count,
        "verified_percentage": verified_percentage
    }


@router.get(
    "/",
    response_model=list[BusinessSummaryResponse]
)
def get_businesses(
    q: str | None = Query(
        default=None
    ),
    db: Session = Depends(get_db)
) -> list[BusinessSummaryResponse]:

    query = db.query(Business)

    if q:
        search_term = f"%{q.strip()}%"

        query = query.filter(
            or_(
                Business.name.ilike(
                    search_term
                ),
                Business.address.ilike(
                    search_term
                ),
                Business.city.ilike(
                    search_term
                ),
                Business.state.ilike(
                    search_term
                )
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

        reviews = (
            db.query(Review)
            .filter(
                Review.business_id
                == business.id
            )
            .all()
        )

        metrics = (
            calculate_business_metrics(
                reviews
            )
        )

        results.append(
            BusinessSummaryResponse(
                id=business.id,
                name=business.name,
                address=business.address,
                city=business.city,
                state=business.state,
                average_rating=(
                    metrics[
                        "average_rating"
                    ]
                ),
                review_count=(
                    metrics[
                        "review_count"
                    ]
                ),
                verified_review_count=(
                    metrics[
                        "verified_review_count"
                    ]
                ),
                verified_percentage=(
                    metrics[
                        "verified_percentage"
                    ]
                )
            )
        )

    return results


@router.get(
    "/{business_id}",
    response_model=BusinessProfileResponse
)
def get_business_profile(
    business_id: int,
    db: Session = Depends(get_db)
) -> BusinessProfileResponse:

    business = (
        db.query(Business)
        .filter(
            Business.id == business_id
        )
        .first()
    )

    if business is None:
        raise HTTPException(
            status_code=404,
            detail="Business not found"
        )

    reviews = (
        db.query(Review)
        .filter(
            Review.business_id
            == business.id
        )
        .order_by(
            Review.created_at.desc()
        )
        .all()
    )

    metrics = (
        calculate_business_metrics(
            reviews
        )
    )

    review_results = [
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
        for review in reviews
    ]

    return BusinessProfileResponse(
        id=business.id,
        name=business.name,
        address=business.address,
        city=business.city,
        state=business.state,
        average_rating=(
            metrics[
                "average_rating"
            ]
        ),
        review_count=(
            metrics[
                "review_count"
            ]
        ),
        verified_review_count=(
            metrics[
                "verified_review_count"
            ]
        ),
        verified_percentage=(
            metrics[
                "verified_percentage"
            ]
        ),
        reviews=review_results
    )