"""
API routes for MoodMeter semantic review retrieval
and grounded sentiment analysis.
"""

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from openai import OpenAIError

from sqlalchemy.orm import Session

from app.db.database import (
    get_db
)

from app.db.models import (
    Business
)

from app.schemas.semantic_retrieval import (
    SemanticReviewSearchRequest,
    SemanticReviewSearchResponse
)

from app.services.ai_sentiment_agent_service import (
    MINIMUM_SUPPORT_SIMILARITY,
    filter_supported_reviews,
    generate_grounded_review_answer
)

from app.services.semantic_retrieval_service import (
    retrieve_semantic_reviews
)


router = APIRouter(
    prefix="/businesses",
    tags=[
        "Businesses"
    ]
)


@router.post(
    "/{business_id}/semantic-search",
    response_model=(
        SemanticReviewSearchResponse
    )
)
def search_business_reviews(
    business_id: int,
    request: (
        SemanticReviewSearchRequest
    ),
    db: Session = Depends(
        get_db
    )
) -> SemanticReviewSearchResponse:

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

    if business is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Business not found."
            )
        )

    try:
        retrieved_results = (
            retrieve_semantic_reviews(
                db=db,
                business_id=(
                    business_id
                ),
                question=(
                    request.question
                ),
                limit=(
                    request.limit
                )
            )
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(
                error
            )
        )

    except OpenAIError:
        raise HTTPException(
            status_code=503,
            detail=(
                "MoodMeter could not search "
                "the review data because the "
                "AI retrieval service is "
                "currently unavailable. "
                "Please try again."
            )
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                "MoodMeter could not retrieve "
                "relevant review information. "
                "Please try again."
            )
        )

    try:
        supported_results = (
            filter_supported_reviews(
                retrieved_results
            )
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                "MoodMeter could not evaluate "
                "the retrieved review results. "
                "Please try again."
            )
        )

    if not supported_results:

        minimum_percentage = (
            int(
                MINIMUM_SUPPORT_SIMILARITY
                * 100
            )
        )

        return (
            SemanticReviewSearchResponse(
                business_id=(
                    business_id
                ),
                question=(
                    request.question
                ),
                answer=(
                    "MoodMeter does not have "
                    "enough relevant verified "
                    "review information to "
                    "reliably answer this "
                    "question."
                ),
                supported=False,
                support_message=(
                    "No retrieved verified "
                    "review met the minimum "
                    f"{minimum_percentage}% "
                    "semantic relevance "
                    "threshold."
                ),
                result_count=0,
                results=[]
            )
        )

    try:
        answer = (
            generate_grounded_review_answer(
                business_name=(
                    business.name
                ),
                question=(
                    request.question
                ),
                reviews=(
                    supported_results
                )
            )
        )

    except OpenAIError:
        raise HTTPException(
            status_code=503,
            detail=(
                "MoodMeter found relevant "
                "reviews, but the AI service "
                "could not generate an answer. "
                "Please try again."
            )
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(
                error
            )
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                "MoodMeter found relevant "
                "reviews, but the AI sentiment "
                "analysis could not be "
                "completed. Please try again."
            )
        )

    if (
        not answer
        or
        not answer.strip()
    ):
        raise HTTPException(
            status_code=502,
            detail=(
                "MoodMeter received an empty "
                "response from the AI service. "
                "Please try again."
            )
        )

    return (
        SemanticReviewSearchResponse(
            business_id=(
                business_id
            ),
            question=(
                request.question
            ),
            answer=(
                answer
            ),
            supported=True,
            support_message=(
                "The answer was generated "
                "using verified MoodMeter "
                "reviews that met the "
                "semantic relevance "
                "threshold."
            ),
            result_count=(
                len(
                    supported_results
                )
            ),
            results=(
                supported_results
            )
        )
    )