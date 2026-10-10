from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.db.models import (
    Business,
    EvidenceFile,
    Review,
    ReviewEvidence,
    SentimentResult,
    User
)

from app.schemas.review import (
    ReviewCreate,
    ReviewDetailBusiness,
    ReviewDetailEvidence,
    ReviewDetailResponse,
    ReviewDetailSentiment
)

from app.services.business_service import (
    get_or_create_business
)

from app.services.business_verification_service import (
    compare_business_information
)

from app.services.security_service import (
    get_current_user
)


router = APIRouter(
    prefix="/reviews",
    tags=["Review"]
)


@router.post("/")
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    )
):
    business = get_or_create_business(
        db=db,
        name=review_data.business_name,
        address=(
            review_data.street_address
        ),
        city=review_data.city,
        state=review_data.state
    )

    review = Review(
        business_id=business.id,
        author_id=current_user.id,
        body=review_data.body,
        rating=review_data.rating
    )

    db.add(
        review
    )

    db.commit()

    db.refresh(
        review
    )

    return review


@router.get(
    "/{review_id}/details",
    response_model=(
        ReviewDetailResponse
    )
)
def get_review_details(
    review_id: int,
    db: Session = Depends(
        get_db
    )
):
    review = (
        db.query(Review)
        .filter(
            Review.id
            == review_id
        )
        .first()
    )

    if review is None:
        raise HTTPException(
            status_code=404,
            detail="Review not found."
        )

    business = (
        db.query(Business)
        .filter(
            Business.id
            == review.business_id
        )
        .first()
    )

    if business is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Business associated with "
                "the review was not found."
            )
        )

    sentiment_result = (
        db.query(
            SentimentResult
        )
        .filter(
            SentimentResult.review_id
            == review.id
        )
        .first()
    )

    sentiment = None

    if sentiment_result:
        sentiment = (
            ReviewDetailSentiment(
                sentiment=(
                    sentiment_result
                    .sentiment
                ),
                themes=(
                    sentiment_result
                    .themes
                    or []
                ),
                aspects=(
                    sentiment_result
                    .aspects
                    or []
                )
            )
        )

    review_evidence = (
        db.query(
            ReviewEvidence
        )
        .filter(
            ReviewEvidence.review_id
            == review.id
        )
        .first()
    )

    evidence = None

    if review_evidence:
        analysis = (
            review_evidence
            .analysis_result
            or {}
        )

        business_comparison = (
            compare_business_information(
                selected_name=(
                    business.name
                ),
                selected_address=(
                    business.address
                ),
                selected_city=(
                    business.city
                ),
                selected_state=(
                    business.state
                ),
                returned_name=(
                    analysis.get(
                        "business_name"
                    )
                ),
                returned_address=(
                    analysis.get(
                        "street_address"
                    )
                ),
                returned_city=(
                    analysis.get(
                        "city"
                    )
                ),
                returned_state=(
                    analysis.get(
                        "state"
                    )
                )
            )
        )

        evidence_files = (
            db.query(EvidenceFile)
            .filter(
                EvidenceFile.evidence_id
                == review_evidence.id
            )
            .all()
        )

        duplicate_evidence = any(
            evidence_file.is_duplicate
            for evidence_file
            in evidence_files
        )

        product_match = (
            analysis.get(
                "purchase_photo_matches_receipt"
            )
        )

        transaction_date_present = (
            bool(
                analysis.get(
                    "transaction_date"
                )
            )
        )

        receipt_readable = bool(
            analysis.get(
                "receipt_readable",
                False
            )
        )

        verification_checks = {
            "business_match":
                business_comparison[
                    "business_match"
                ],

            "product_match":
                product_match,

            "transaction_date_present":
                transaction_date_present,

            "duplicate_evidence":
                duplicate_evidence,

            "receipt_readable":
                receipt_readable
        }

        evidence = (
            ReviewDetailEvidence(
                analysis=analysis,

                business_comparison=(
                    business_comparison
                ),

                duplicate_evidence=(
                    duplicate_evidence
                ),

                verification_checks=(
                    verification_checks
                )
            )
        )

    return ReviewDetailResponse(
        id=review.id,

        rating=review.rating,

        body=review.body,

        verification_status=(
            review.verification_status
        ),

        created_at=(
            review.created_at
        ),

        business=(
            ReviewDetailBusiness(
                id=business.id,
                name=business.name,
                address=business.address,
                city=business.city,
                state=business.state
            )
        ),

        sentiment=sentiment,

        evidence=evidence
    )