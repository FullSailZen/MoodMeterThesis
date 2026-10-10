from sqlalchemy.orm import Session

from app.db.models import (
    Review,
    SentimentResult
)


RATING_WEIGHT = 0.60
SENTIMENT_WEIGHT = 0.40


RATING_COMPONENTS = {
    1: 0.0,
    2: 25.0,
    3: 50.0,
    4: 75.0,
    5: 100.0
}


def determine_business_sentiment(
    moodscore: float
) -> str:

    if moodscore >= 60:
        return "positive"

    if moodscore < 40:
        return "negative"

    return "mixed"


def calculate_business_moodscore(
    db: Session,
    business_id: int
) -> dict:

    results = (
        db.query(
            Review,
            SentimentResult
        )
        .join(
            SentimentResult,
            SentimentResult.review_id
            == Review.id
        )
        .filter(
            Review.business_id
            == business_id,
            Review.verification_status
            == "verified"
        )
        .all()
    )

    eligible_review_count = len(
        results
    )

    if eligible_review_count == 0:
        return {
            "business_id":
                business_id,

            "eligible_review_count":
                0,

            "positive_review_count":
                0,

            "negative_review_count":
                0,

            "average_rating":
                None,

            "rating_component":
                None,

            "positive_sentiment_percentage":
                None,

            "negative_sentiment_percentage":
                None,

            "moodscore":
                None,

            "overall_sentiment":
                "unavailable"
        }

    rating_total = 0.0

    raw_rating_total = 0.0

    positive_review_count = 0

    negative_review_count = 0


    for (
        review,
        sentiment_result
    ) in results:

        raw_rating_total += (
            review.rating
        )

        rating_total += (
            RATING_COMPONENTS[
                review.rating
            ]
        )

        if (
            sentiment_result.sentiment
            == "positive"
        ):
            positive_review_count += 1

        elif (
            sentiment_result.sentiment
            == "negative"
        ):
            negative_review_count += 1


    average_rating = round(
        raw_rating_total
        / eligible_review_count,
        2
    )


    rating_component = round(
        rating_total
        / eligible_review_count,
        2
    )


    positive_sentiment_percentage = (
        round(
            (
                positive_review_count
                / eligible_review_count
            )
            * 100,
            2
        )
    )


    negative_sentiment_percentage = (
        round(
            (
                negative_review_count
                / eligible_review_count
            )
            * 100,
            2
        )
    )


    moodscore = round(
        (
            rating_component
            * RATING_WEIGHT
        )
        +
        (
            positive_sentiment_percentage
            * SENTIMENT_WEIGHT
        ),
        2
    )


    overall_sentiment = (
        determine_business_sentiment(
            moodscore
        )
    )


    return {
        "business_id":
            business_id,

        "eligible_review_count":
            eligible_review_count,

        "positive_review_count":
            positive_review_count,

        "negative_review_count":
            negative_review_count,

        "average_rating":
            average_rating,

        "rating_component":
            rating_component,

        "positive_sentiment_percentage":
            positive_sentiment_percentage,

        "negative_sentiment_percentage":
            negative_sentiment_percentage,

        "moodscore":
            moodscore,

        "overall_sentiment":
            overall_sentiment
    }