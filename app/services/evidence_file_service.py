import hashlib

from sqlalchemy.orm import Session

from app.db.models import EvidenceFile
from app.services.evidence_storage_service import (
    PROJECT_ROOT,
    save_evidence_file
)


def generate_sha256(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()


def save_and_record_evidence_file(
    db: Session,
    evidence_id: int,
    review_id: int,
    file_type: str,
    file_bytes: bytes,
    content_type: str | None
) -> EvidenceFile:

    if content_type is None:
        raise ValueError("Missing image content type")

    file_hash = generate_sha256(file_bytes)

    existing_file = (
        db.query(EvidenceFile)
        .filter(EvidenceFile.sha256_hash == file_hash)
        .first()
    )

    is_duplicate = existing_file is not None

    file_path = save_evidence_file(
        review_id=review_id,
        file_type=file_type,
        file_bytes=file_bytes,
        content_type=content_type
    )

    relative_path = file_path.relative_to(PROJECT_ROOT).as_posix()

    evidence_file = EvidenceFile(
        evidence_id=evidence_id,
        file_type=file_type,
        file_path=relative_path,
        content_type=content_type,
        sha256_hash=file_hash,
        is_duplicate=is_duplicate
    )

    db.add(evidence_file)

    return evidence_file