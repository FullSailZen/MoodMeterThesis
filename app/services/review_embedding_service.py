"""
Generates and stores embeddings for eligible MoodMeter reviews.
"""

import os

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session

from app.db.models import (
    Review,
    ReviewEmbedding,
    SentimentResult
)


load_dotenv()

client = OpenAI()


EMBEDDING_MODEL = os.getenv(
    "OPENAI_EMBEDDING_MODEL"
)

if not EMBEDDING_MODEL:
    raise RuntimeError(
        "OPENAI_EMBEDDING_MODEL is not configured."
    )


def generate_review_embedding(
    review_text: str
) -> list[float]:

    cleaned_text = review_text.strip()

    if not cleaned_text:
        raise ValueError(
            "Review text cannot be empty."
        )

    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=cleaned_text
    )

    if not response.data:
        raise ValueError(
            "OpenAI did not return an embedding."
        )

    embedding = response.data[0].embedding

    if not embedding:
        raise ValueError(
            "OpenAI returned an empty embedding."
        )

    return embedding


def save_review_embedding(
    db: Session,
    review_id: int,
    embedding: list[float]
) -> ReviewEmbedding:

    existing_embedding = (
        db.query(ReviewEmbedding)
        .filter(
            ReviewEmbedding.review_id
            == review_id
        )
        .first()
    )

    if existing_embedding is not None:
        existing_embedding.embedding = (
            embedding
        )

        return existing_embedding

    review_embedding = ReviewEmbedding(
        review_id=review_id,
        embedding=embedding
    )

    db.add(
        review_embedding
    )

    return review_embedding


def get_review_embedding_for_review(
    db: Session,
    review_id: int
) -> ReviewEmbedding | None:

    return (
        db.query(ReviewEmbedding)
        .filter(
            ReviewEmbedding.review_id
            == review_id
        )
        .first()
    )


def generate_embedding_for_eligible_review(
    db: Session,
    review: Review
) -> list[float] | None:

    if (
        review.verification_status
        != "verified"
    ):
        return None

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

    if sentiment_result is None:
        return None

    embedding = generate_review_embedding(
        review.body
    )

    save_review_embedding(
        db=db,
        review_id=review.id,
        embedding=embedding
    )

    db.flush()

    stored_embedding = (
        get_review_embedding_for_review(
            db=db,
            review_id=review.id
        )
    )

    if stored_embedding is None:
        raise ValueError(
            "Review embedding was not stored."
        )

    if (
        stored_embedding.review_id
        != review.id
    ):
        raise ValueError(
            "Stored embedding is associated "
            "with the wrong review."
        )

    if (
        stored_embedding.embedding
        is None
    ):
        raise ValueError(
            "Stored review embedding is empty."
        )

    if (
        len(stored_embedding.embedding)
        != len(embedding)
    ):
        raise ValueError(
            "Stored review embedding has "
            "unexpected dimensions."
        )

    return list(
        stored_embedding.embedding
    )