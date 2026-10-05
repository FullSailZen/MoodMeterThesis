from sqlalchemy.orm import Session

from app.db.models import Review


def evaluate_verification(
    business_match: bool,
    product_match: bool | None,
    transaction_date_present: bool,
    duplicate_evidence: bool,
    receipt_readable: bool
) -> dict:

    verification_checks = {
        "business_match": business_match,
        "product_match": product_match,
        "transaction_date_present": transaction_date_present,
        "duplicate_evidence": duplicate_evidence,
        "receipt_readable": receipt_readable
    }

    required_checks_passed = (
        business_match
        and transaction_date_present
        and receipt_readable
    )

    product_check_passed = (
        product_match is True
        or product_match is None
    )

    verified = (
        required_checks_passed
        and product_check_passed
    )

    return {
        "verified": verified,
        "checks": verification_checks
    }


def save_verification_status(
    db: Session,
    review: Review,
    verified: bool
) -> Review:

    review.verification_status = (
        "verified"
        if verified
        else "unverified"
    )

    db.add(review)
    db.flush()

    return review