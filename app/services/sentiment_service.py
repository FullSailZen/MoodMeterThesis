"""
Stores sentiment analysis results for MoodMeter reviews.
"""

from datetime import datetime

from sqlalchemy.orm import Session

from app.db.models import SentimentResult

from app.schemas.sentiment import (
    SentimentAnalysisResult
)


def save_sentiment_result(
    db: Session,
    review_id: int,
    result: SentimentAnalysisResult
) -> SentimentResult:

    existing_result = (
        db.query(SentimentResult)
        .filter(
            SentimentResult.review_id
            == review_id
        )
        .first()
    )

    themes = result.themes

    aspects = [
        aspect.model_dump(
            mode="json"
        )
        for aspect in result.aspects
    ]

    if existing_result:

        existing_result.sentiment = (
            result.sentiment
        )

        existing_result.themes = (
            themes
        )

        existing_result.aspects = (
            aspects
        )

        existing_result.created_at = (
            datetime.now()
        )

        db.flush()

        return existing_result

    sentiment_result = SentimentResult(
        review_id=review_id,
        sentiment=result.sentiment,
        themes=themes,
        aspects=aspects
    )

    db.add(
        sentiment_result
    )

    db.flush()

    return sentiment_result