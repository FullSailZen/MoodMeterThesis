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
    BusinessMoodScore
)

from app.schemas.business import (
    ExternalBusinessSearchResponse,
    ExternalMoodScoreResponse
)

from app.services.moodscore_service import (
    calculate_business_moodscore
)


router = APIRouter(
    prefix="/api/v1",
    tags=["External MoodScore API"]
)


@router.get(
    "/businesses",
    response_model=list[
        ExternalBusinessSearchResponse
    ],
    summary="Search MoodMeter businesses",
    description=(
        "Search for businesses by name. "
        "Use the returned business_id "
        "to request the current MoodScore."
    )
)
def search_external_businesses(
    q: str = Query(
        min_length=1,
        description=(
            "Business name or partial "
            "business name."
        )
    ),
    db: Session = Depends(
        get_db
    )
):
    search_value = (
        q.strip()
    )

    if not search_value:
        raise HTTPException(
            status_code=400,
            detail=(
                "Business search cannot "
                "be empty."
            )
        )

    businesses = (
        db.query(
            Business
        )
        .filter(
            Business.name.ilike(
                f"%{search_value}%"
            )
        )
        .order_by(
            Business.name.asc(),
            Business.city.asc(),
            Business.state.asc()
        )
        .limit(
            25
        )
        .all()
    )

    return [
        ExternalBusinessSearchResponse(
            business_id=business.id,
            name=business.name,
            address=business.address,
            city=business.city,
            state=business.state
        )
        for business in businesses
    ]


@router.get(
    "/businesses/{business_id}/moodscore",
    response_model=ExternalMoodScoreResponse,
    summary="Get current business MoodScore",
    description=(
        "Returns the current public "
        "MoodMeter score and supporting "
        "summary information for a "
        "business."
    )
)
def get_external_business_moodscore(
    business_id: int,
    db: Session = Depends(
        get_db
    )
):
    business = (
        db.query(
            Business
        )
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

    stored_moodscore = (
        db.query(
            BusinessMoodScore
        )
        .filter(
            BusinessMoodScore.business_id
            == business.id
        )
        .first()
    )

    if stored_moodscore:
        return ExternalMoodScoreResponse(
            business_id=business.id,
            business_name=business.name,
            address=business.address,
            city=business.city,
            state=business.state,

            moodscore=(
                stored_moodscore.moodscore
            ),

            overall_sentiment=(
                stored_moodscore
                .overall_sentiment
            ),

            eligible_review_count=(
                stored_moodscore
                .eligible_review_count
            ),

            average_rating=(
                stored_moodscore
                .average_rating
            ),

            positive_sentiment_percentage=(
                stored_moodscore
                .positive_sentiment_percentage
            ),

            negative_sentiment_percentage=(
                stored_moodscore
                .negative_sentiment_percentage
            )
        )

    result = (
        calculate_business_moodscore(
            db=db,
            business_id=business.id
        )
    )

    return ExternalMoodScoreResponse(
        business_id=business.id,
        business_name=business.name,
        address=business.address,
        city=business.city,
        state=business.state,

        moodscore=(
            result[
                "moodscore"
            ]
        ),

        overall_sentiment=(
            result[
                "overall_sentiment"
            ]
        ),

        eligible_review_count=(
            result[
                "eligible_review_count"
            ]
        ),

        average_rating=(
            result[
                "average_rating"
            ]
        ),

        positive_sentiment_percentage=(
            result[
                "positive_sentiment_percentage"
            ]
        ),

        negative_sentiment_percentage=(
            result[
                "negative_sentiment_percentage"
            ]
        )
    )