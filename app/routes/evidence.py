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
from app.db.models import Review, ReviewEvidence, User
from app.schemas.evidence import EvidenceAnalysisResult
from app.services.evidence_analysis_service import analyze_evidence
from app.services.evidence_file_service import save_and_record_evidence_file
from app.services.evidence_storage_service import ALLOWED_IMAGE_TYPES
from app.services.review_evidence_service import create_review_evidence
from app.services.security_service import get_current_user


MAX_FILE_SIZE = 10 * 1024 * 1024


UploadFile = Annotated[
    FastAPIUploadFile,
    WithJsonSchema({
        "type": "string",
        "format": "binary"
    })
]


router = APIRouter(
    prefix="/evidence",
    tags=["Evidence"]
)


@router.post(
    "/analyze",
    response_model=EvidenceAnalysisResult
)
async def analyze_submitted_evidence(
    review_id: int = Form(...),
    receipt: UploadFile = File(...),
    purchase_images: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> EvidenceAnalysisResult:

    review = (
        db.query(Review)
        .filter(
            Review.id == review_id,
            Review.author_id == current_user.id
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
        .filter(ReviewEvidence.review_id == review_id)
        .first()
    )

    if existing_evidence:
        raise HTTPException(
            status_code=409,
            detail="Evidence already exists for this review"
        )

    if receipt.content_type is None:
        raise HTTPException(
            status_code=400,
            detail="Receipt content type is missing"
        )

    if receipt.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported receipt image type"
        )

    receipt_bytes = await receipt.read()

    if len(receipt_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Receipt image exceeds 10 MB"
        )

    purchase_files: list[tuple[bytes, str]] = []

    for image in purchase_images:
        if image.content_type is None:
            raise HTTPException(
                status_code=400,
                detail="Purchase image content type is missing"
            )

        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Unsupported purchase image type"
            )

        image_bytes = await image.read()

        if len(image_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="Purchase image exceeds 10 MB"
            )

        purchase_files.append(
            (image_bytes, image.content_type)
        )

    result = analyze_evidence(
        receipt_bytes=receipt_bytes,
        receipt_content_type=receipt.content_type,
        purchase_images=purchase_files
    )

    try:
        review_evidence = create_review_evidence(
            db=db,
            review_id=review.id,
            analysis_result=result.model_dump(mode="json")
        )

        save_and_record_evidence_file(
            db=db,
            evidence_id=review_evidence.id,
            review_id=review.id,
            file_type="receipt",
            file_bytes=receipt_bytes,
            content_type=receipt.content_type
        )

        for purchase_bytes, purchase_content_type in purchase_files:
            save_and_record_evidence_file(
                db=db,
                evidence_id=review_evidence.id,
                review_id=review.id,
                file_type="purchase",
                file_bytes=purchase_bytes,
                content_type=purchase_content_type
            )

        db.commit()

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    return result