from pathlib import Path
from uuid import uuid4


PROJECT_ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_ROOT = PROJECT_ROOT / "uploads" / "evidence"

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
}


def get_review_evidence_directory(review_id: int) -> Path:
    review_directory = EVIDENCE_ROOT / f"review_{review_id}"

    review_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    return review_directory


def save_evidence_file(
    review_id: int,
    file_type: str,
    file_bytes: bytes,
    content_type: str | None
) -> Path:

    if file_type not in {"receipt", "purchase"}:
        raise ValueError("Invalid evidence file type")

    extension = ALLOWED_IMAGE_TYPES.get(content_type)

    if extension is None:
        raise ValueError("Unsupported image content type")

    review_directory = get_review_evidence_directory(review_id)

    filename = f"{file_type}_{uuid4().hex}{extension}"

    file_path = review_directory / filename

    file_path.write_bytes(file_bytes)

    return file_path