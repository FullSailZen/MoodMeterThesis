from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query
)

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.db.models import (
    Business,
    BusinessReviewSummaryCache,
    Review,
    SentimentResult
)

from app.schemas.business import (
    BusinessProfileResponse,
    BusinessReviewResponse,
    BusinessReviewSummaryResponse,
    BusinessSummaryResponse
)

from app.services.review_summary_service import (
    build_review_signature,
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


def build_summary_review_data(
    reviews: list[Review]
) -> list[dict]:

    review_data = []

    for review in reviews:
        review_data.append(
            {
                "id":
                    review.id,

                "rating":
                    review.rating,

                "body":
                    review.body,

                "verification_status":
                    review.verification_status
            }
        )

    return review_data


def cached_summary_to_response(
    cached_summary: (
        BusinessReviewSummaryCache
    )
) -> BusinessReviewSummaryResponse:

    return BusinessReviewSummaryResponse(
        review_count=(
            cached_summary.review_count
        ),

        summary=(
            cached_summary.summary
        ),

        overall_sentiment=(
            cached_summary
            .overall_sentiment
        ),

        positive_themes=(
            cached_summary
            .positive_themes
            or []
        ),

        negative_themes=(
            cached_summary
            .negative_themes
            or []
        ),

        recurring_themes=(
            cached_summary
            .recurring_themes
            or []
        )
    )


def save_summary_cache(
    db: Session,
    business_id: int,
    review_signature: str,
    summary_result: (
        BusinessReviewSummaryResponse
    )
):

    cached_summary = (
        db.query(
            BusinessReviewSummaryCache
        )
        .filter(
            BusinessReviewSummaryCache
            .business_id
            == business_id
        )
        .first()
    )

    if cached_summary:
        cached_summary.review_signature = (
            review_signature
        )

        cached_summary.review_count = (
            summary_result.review_count
        )

        cached_summary.summary = (
            summary_result.summary
        )

        cached_summary.overall_sentiment = (
            summary_result
            .overall_sentiment
        )

        cached_summary.positive_themes = (
            summary_result
            .positive_themes
        )

        cached_summary.negative_themes = (
            summary_result
            .negative_themes
        )

        cached_summary.recurring_themes = (
            summary_result
            .recurring_themes
        )

        cached_summary.generated_at = (
            datetime.now()
        )

    else:
        cached_summary = (
            BusinessReviewSummaryCache(
                business_id=(
                    business_id
                ),
                review_signature=(
                    review_signature
                ),
                review_count=(
                    summary_result
                    .review_count
                ),
                summary=(
                    summary_result.summary
                ),
                overall_sentiment=(
                    summary_result
                    .overall_sentiment
                ),
                positive_themes=(
                    summary_result
                    .positive_themes
                ),
                negative_themes=(
                    summary_result
                    .negative_themes
                ),
                recurring_themes=(
                    summary_result
                    .recurring_themes
                ),
                generated_at=(
                    datetime.now()
                )
            )
        )

        db.add(
            cached_summary
        )

    db.commit()


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
            Review.created_at.desc(),
            Review.id.desc()
        )
        .all()
    )

    review_data = (
        build_summary_review_data(
            reviews
        )
    )

    review_signature = (
        build_review_signature(
            review_data
        )
    )

    cached_summary = (
        db.query(
            BusinessReviewSummaryCache
        )
        .filter(
            BusinessReviewSummaryCache
            .business_id
            == business_id
        )
        .first()
    )

    if (
        cached_summary
        and
        cached_summary.review_signature
        == review_signature
    ):
        return cached_summary_to_response(
            cached_summary
        )

    try:
        summary_result = (
            generate_review_summary(
                business_name=(
                    business.name
                ),
                reviews=review_data
            )
        )

        save_summary_cache(
            db=db,
            business_id=(
                business.id
            ),
            review_signature=(
                review_signature
            ),
            summary_result=(
                summary_result
            )
        )

        return summary_result

    except Exception as error:

        db.rollback()

        print(
            "Review summary error:",
            error
        )

        if cached_summary:
            return cached_summary_to_response(
                cached_summary
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

        sentiment_result = (
            db.query(SentimentResult)
            .filter(
                SentimentResult.review_id
                == review.id
            )
            .first()
        )

        sentiment = None

        if sentiment_result:
            sentiment = (
                sentiment_result.sentiment
            )

        review_results.append(
            BusinessReviewResponse(
                id=review.id,
                rating=review.rating,
                body=review.body,
                verification_status=(
                    review.verification_status
                ),
                sentiment=sentiment,
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