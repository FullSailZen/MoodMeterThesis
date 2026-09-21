"""
API routes for MoodMeter evidence analysis.
"""

from typing import Annotated

from fastapi import APIRouter, File, UploadFile as FastAPIUploadFile
from pydantic import WithJsonSchema

from app.schemas.evidence import EvidenceAnalysisResult
from app.services.evidence_analysis_service import analyze_evidence

"""
Forcing Swagger to understand this is not a normal binary text string,
it is a file input.
"""
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
    receipt: UploadFile = File(...),
    purchase_images: list[UploadFile] = File(...)
) -> EvidenceAnalysisResult:
    """
    Receive one receipt image and one or more purchase evidence images
    and analyze them using the multimodal evidence analysis service.
    """

    receipt_bytes = await receipt.read()

    purchase_files: list[tuple[bytes, str]] = []

    for image in purchase_images:
        image_bytes = await image.read()
        content_type = image.content_type

        purchase_files.append(
            (image_bytes, content_type)
        )

    result = analyze_evidence(
        receipt_bytes=receipt_bytes,
        receipt_content_type=receipt.content_type,
        purchase_images=purchase_files
    )

    return result