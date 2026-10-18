"""
Retrieves semantically relevant MoodMeter reviews.
"""

from sqlalchemy.orm import Session

from app.db.models import (
    Review,
    ReviewEmbedding
)

from app.services.review_embedding_service import (
    generate_review_embedding
)


def retrieve_semantic_reviews(
    db: Session,
    business_id: int,
    question: str,
    limit: int = 5
) -> list[dict]:

    cleaned_question = (
        question.strip()
    )

    if not cleaned_question:
        raise ValueError(
            "Question cannot be empty."
        )

    if (
        limit < 1
        or limit > 10
    ):
        raise ValueError(
            "Limit must be between 1 and 10."
        )

    question_embedding = (
        generate_review_embedding(
            cleaned_question
        )
    )

    cosine_distance = (
        ReviewEmbedding.embedding
        .cosine_distance(
            question_embedding
        )
        .label(
            "cosine_distance"
        )
    )

    rows = (
        db.query(
            Review,
            cosine_distance
        )
        .join(
            ReviewEmbedding,
            ReviewEmbedding.review_id
            == Review.id
        )
        .filter(
            Review.business_id
            == business_id,
            Review.verification_status
            == "verified"
        )
        .order_by(
            cosine_distance.asc()
        )
        .limit(
            limit
        )
        .all()
    )

    results = []

    for (
        review,
        distance
    ) in rows:

        similarity = (
            1.0
            - float(
                distance
            )
        )

        results.append(
            {
                "review_id":
                    review.id,

                "rating":
                    review.rating,

                "body":
                    review.body,

                "verification_status":
                    review.verification_status,

                "similarity":
                    round(
                        similarity,
                        4
                    )
            }
        )

    return results