from sqlalchemy.orm import Session

from app.db.models import EvidenceFile, ReviewEvidence


def create_review_evidence(
    db: Session,
    review_id: int,
    analysis_result: dict
) -> ReviewEvidence:

    existing_evidence = (
        db.query(ReviewEvidence)
        .filter(ReviewEvidence.review_id == review_id)
        .first()
    )

    if existing_evidence:
        raise ValueError("Evidence already exists for this review")

    review_evidence = ReviewEvidence(
        review_id=review_id,
        analysis_result=analysis_result
    )

    db.add(review_evidence)
    db.flush()

    return review_evidence


def has_duplicate_evidence(
    db: Session,
    review_id: int
) -> bool:

    review_evidence = (
        db.query(ReviewEvidence)
        .filter(ReviewEvidence.review_id == review_id)
        .first()
    )

    if review_evidence is None:
        return False

    duplicate_file = (
        db.query(EvidenceFile)
        .filter(
            EvidenceFile.evidence_id == review_evidence.id,
            EvidenceFile.is_duplicate == True
        )
        .first()
    )

    return duplicate_file is not None