"""
API routes for MoodMeter evidence analysis.
"""

from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile as FastAPIUploadFile
)

from pydantic import WithJsonSchema
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.db.models import (
    Business,
    Review,
    ReviewEvidence,
    User
)

from app.schemas.evidence import (
    EvidenceSubmissionResult
)

from app.services.business_verification_service import (
    compare_business_information
)

from app.services.evidence_analysis_service import (
    analyze_evidence
)

from app.services.evidence_evaluation_service import (
    evaluate_transaction_and_product_information
)

from app.services.evidence_file_service import (
    save_and_record_evidence_file
)

from app.services.evidence_storage_service import (
    ALLOWED_IMAGE_TYPES
)

from app.services.product_comparison_service import (
    compare_product_information
)

from app.services.review_evidence_service import (
    create_review_evidence,
    has_duplicate_evidence
)

from app.services.security_service import (
    get_current_user
)

from app.services.upc_lookup_service import (
    lookup_upc
)

from app.services.verification_service import (
    evaluate_verification,
    save_verification_status
)


MAX_FILE_SIZE = (
    10 * 1024 * 1024
)


UploadFile = Annotated[
    FastAPIUploadFile,
    WithJsonSchema(
        {
            "type": "string",
            "format": "binary"
        }
    )
]


router = APIRouter(
    prefix="/evidence",
    tags=["Evidence"]
)


@router.post(
    "/analyze",
    response_model=EvidenceSubmissionResult
)
async def analyze_submitted_evidence(
    review_id: int = Form(...),
    receipt: UploadFile = File(...),
    purchase_images: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
) -> EvidenceSubmissionResult:

    review = (
        db.query(Review)
        .filter(
            Review.id == review_id,
            Review.author_id
            == current_user.id
        )
        .first()
    )


    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )


    existing_evidence = (
        db.query(ReviewEvidence)
        .filter(
            ReviewEvidence.review_id
            == review_id
        )
        .first()
    )


    if existing_evidence:
        raise HTTPException(
            status_code=409,
            detail=(
                "Evidence already exists "
                "for this review"
            )
        )


    if receipt.content_type is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Receipt content type "
                "is missing"
            )
        )


    if (
        receipt.content_type
        not in ALLOWED_IMAGE_TYPES
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported receipt "
                "image type"
            )
        )


    receipt_bytes = (
        await receipt.read()
    )


    if (
        len(receipt_bytes)
        > MAX_FILE_SIZE
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Receipt image exceeds "
                "10 MB"
            )
        )


    purchase_files: list[
        tuple[bytes, str]
    ] = []


    for image in purchase_images:

        if image.content_type is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Purchase image content "
                    "type is missing"
                )
            )


        if (
            image.content_type
            not in ALLOWED_IMAGE_TYPES
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Unsupported purchase "
                    "image type"
                )
            )


        image_bytes = (
            await image.read()
        )


        if (
            len(image_bytes)
            > MAX_FILE_SIZE
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Purchase image exceeds "
                    "10 MB"
                )
            )


        purchase_files.append(
            (
                image_bytes,
                image.content_type
            )
        )


    result = analyze_evidence(
        receipt_bytes=receipt_bytes,
        receipt_content_type=(
            receipt.content_type
        ),
        purchase_images=purchase_files
    )


    try:

        review_evidence = (
            create_review_evidence(
                db=db,
                review_id=review.id,
                analysis_result=(
                    result.model_dump(
                        mode="json"
                    )
                )
            )
        )


        save_and_record_evidence_file(
            db=db,
            evidence_id=(
                review_evidence.id
            ),
            review_id=review.id,
            file_type="receipt",
            file_bytes=receipt_bytes,
            content_type=(
                receipt.content_type
            )
        )


        for (
            purchase_bytes,
            purchase_content_type
        ) in purchase_files:

            save_and_record_evidence_file(
                db=db,
                evidence_id=(
                    review_evidence.id
                ),
                review_id=review.id,
                file_type="purchase",
                file_bytes=(
                    purchase_bytes
                ),
                content_type=(
                    purchase_content_type
                )
            )


        selected_business = (
            db.query(Business)
            .filter(
                Business.id
                == review.business_id
            )
            .first()
        )


        if selected_business is None:
            raise ValueError(
                "Selected business not found"
            )


        business_comparison = (
            compare_business_information(
                selected_name=(
                    selected_business.name
                ),
                selected_address=(
                    selected_business.address
                ),
                selected_city=(
                    selected_business.city
                ),
                selected_state=(
                    selected_business.state
                ),
                returned_name=(
                    result.business_name
                ),
                returned_address=(
                    result.street_address
                ),
                returned_city=(
                    result.city
                ),
                returned_state=(
                    result.state
                )
            )
        )


        product_comparisons = []


        matched_name = (
            result
            .matched_purchase_item_name
        )

        matched_upc = (
            result
            .matched_purchase_item_upc
        )


        if (
            result
            .purchase_photo_matches_receipt
            is True
        ):

            external_product = None


            if matched_upc:
                external_product = (
                    lookup_upc(
                        matched_upc
                    )
                )


            comparison = (
                compare_product_information(
                    receipt_item={
                        "name": matched_name,
                        "upc": matched_upc
                    },
                    external_product=(
                        external_product
                    )
                )
            )


            product_comparisons.append(
                comparison
            )


        evidence_evaluation = (
            evaluate_transaction_and_product_information(
                evidence_result=result,
                product_comparisons=(
                    product_comparisons
                )
            )
        )


        duplicate_evidence = (
            has_duplicate_evidence(
                db=db,
                review_id=review.id
            )
        )


        verification_result = (
            evaluate_verification(
                business_match=(
                    business_comparison[
                        "business_match"
                    ]
                ),
                product_match=(
                    evidence_evaluation[
                        "product_match"
                    ]
                ),
                transaction_date_present=(
                    evidence_evaluation[
                        "transaction_date_present"
                    ]
                ),
                duplicate_evidence=(
                    duplicate_evidence
                ),
                receipt_readable=(
                    result.receipt_readable
                )
            )
        )


        save_verification_status(
            db=db,
            review=review,
            verified=(
                verification_result[
                    "verified"
                ]
            )
        )


        db.commit()

        db.refresh(
            review
        )


    except ValueError as error:

        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


    return EvidenceSubmissionResult(
        review_id=review.id,

        verification_status=(
            review.verification_status
        ),

        analysis=result,

        business_comparison=(
            business_comparison
        ),

        evidence_evaluation=(
            evidence_evaluation
        ),

        duplicate_evidence=(
            duplicate_evidence
        ),

        verification_checks=(
            verification_result[
                "checks"
            ]
        )
    )