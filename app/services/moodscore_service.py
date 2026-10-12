from datetime import datetime

from sqlalchemy.orm import Session

from app.db.models import (
    BusinessMoodScore,
    BusinessMoodScoreHistory,
    Review,
    SentimentResult
)


MINIMUM_ELIGIBLE_REVIEWS = 3


RATING_WEIGHT = 0.50
SENTIMENT_WEIGHT = 0.30
THEME_WEIGHT = 0.20


FALLBACK_RATING_WEIGHT = 0.60
FALLBACK_SENTIMENT_WEIGHT = 0.40


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

            "theme_count":
                0,

            "aspect_count":
                0,

            "positive_aspect_count":
                0,

            "negative_aspect_count":
                0,

            "positive_aspect_percentage":
                None,

            "negative_aspect_percentage":
                None,

            "theme_component":
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

    positive_aspect_count = 0
    negative_aspect_count = 0

    unique_themes = set()

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

        themes = (
            sentiment_result.themes
            or []
        )

        for theme in themes:

            normalized_theme = (
                str(theme)
                .strip()
                .lower()
            )

            if normalized_theme:

                unique_themes.add(
                    normalized_theme
                )

        aspects = (
            sentiment_result.aspects
            or []
        )

        for aspect in aspects:

            if not isinstance(
                aspect,
                dict
            ):

                continue

            aspect_sentiment = (
                str(
                    aspect.get(
                        "sentiment",
                        ""
                    )
                )
                .strip()
                .lower()
            )

            if (
                aspect_sentiment
                == "positive"
            ):

                positive_aspect_count += 1

            elif (
                aspect_sentiment
                == "negative"
            ):

                negative_aspect_count += 1

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

    aspect_count = (
        positive_aspect_count
        +
        negative_aspect_count
    )

    theme_count = len(
        unique_themes
    )

    if aspect_count > 0:

        positive_aspect_percentage = (
            round(
                (
                    positive_aspect_count
                    / aspect_count
                )
                * 100,
                2
            )
        )

        negative_aspect_percentage = (
            round(
                (
                    negative_aspect_count
                    / aspect_count
                )
                * 100,
                2
            )
        )

        theme_component = (
            positive_aspect_percentage
        )

        calculated_moodscore = round(
            (
                rating_component
                * RATING_WEIGHT
            )
            +
            (
                positive_sentiment_percentage
                * SENTIMENT_WEIGHT
            )
            +
            (
                theme_component
                * THEME_WEIGHT
            ),
            2
        )

    else:

        positive_aspect_percentage = None
        negative_aspect_percentage = None
        theme_component = None

        calculated_moodscore = round(
            (
                rating_component
                * FALLBACK_RATING_WEIGHT
            )
            +
            (
                positive_sentiment_percentage
                * FALLBACK_SENTIMENT_WEIGHT
            ),
            2
        )

    if (
        eligible_review_count
        < MINIMUM_ELIGIBLE_REVIEWS
    ):

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

            "theme_count":
                theme_count,

            "aspect_count":
                aspect_count,

            "positive_aspect_count":
                positive_aspect_count,

            "negative_aspect_count":
                negative_aspect_count,

            "positive_aspect_percentage":
                positive_aspect_percentage,

            "negative_aspect_percentage":
                negative_aspect_percentage,

            "theme_component":
                theme_component,

            "moodscore":
                None,

            "overall_sentiment":
                "insufficient_data"
        }

    moodscore = (
        calculated_moodscore
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

        "theme_count":
            theme_count,

        "aspect_count":
            aspect_count,

        "positive_aspect_count":
            positive_aspect_count,

        "negative_aspect_count":
            negative_aspect_count,

        "positive_aspect_percentage":
            positive_aspect_percentage,

        "negative_aspect_percentage":
            negative_aspect_percentage,

        "theme_component":
            theme_component,

        "moodscore":
            moodscore,

        "overall_sentiment":
            overall_sentiment
    }


def save_business_moodscore(
    db: Session,
    result: dict
) -> bool:

    if (
        result.get(
            "moodscore"
        )
        is None
    ):
        return False

    business_id = (
        result[
            "business_id"
        ]
    )

    calculated_at = (
        datetime.now()
    )

    current_result = (
        db.query(
            BusinessMoodScore
        )
        .filter(
            BusinessMoodScore.business_id
            == business_id
        )
        .first()
    )

    if current_result is None:

        current_result = (
            BusinessMoodScore(
                business_id=business_id,
                eligible_review_count=(
                    result[
                        "eligible_review_count"
                    ]
                ),
                positive_review_count=(
                    result[
                        "positive_review_count"
                    ]
                ),
                negative_review_count=(
                    result[
                        "negative_review_count"
                    ]
                ),
                average_rating=(
                    result[
                        "average_rating"
                    ]
                ),
                rating_component=(
                    result[
                        "rating_component"
                    ]
                ),
                positive_sentiment_percentage=(
                    result[
                        "positive_sentiment_percentage"
                    ]
                ),
                negative_sentiment_percentage=(
                    result[
                        "negative_sentiment_percentage"
                    ]
                ),
                theme_count=(
                    result[
                        "theme_count"
                    ]
                ),
                aspect_count=(
                    result[
                        "aspect_count"
                    ]
                ),
                positive_aspect_count=(
                    result[
                        "positive_aspect_count"
                    ]
                ),
                negative_aspect_count=(
                    result[
                        "negative_aspect_count"
                    ]
                ),
                positive_aspect_percentage=(
                    result[
                        "positive_aspect_percentage"
                    ]
                ),
                negative_aspect_percentage=(
                    result[
                        "negative_aspect_percentage"
                    ]
                ),
                theme_component=(
                    result[
                        "theme_component"
                    ]
                ),
                moodscore=(
                    result[
                        "moodscore"
                    ]
                ),
                overall_sentiment=(
                    result[
                        "overall_sentiment"
                    ]
                ),
                updated_at=(
                    calculated_at
                )
            )
        )

        db.add(
            current_result
        )

    else:

        current_result.eligible_review_count = (
            result[
                "eligible_review_count"
            ]
        )

        current_result.positive_review_count = (
            result[
                "positive_review_count"
            ]
        )

        current_result.negative_review_count = (
            result[
                "negative_review_count"
            ]
        )

        current_result.average_rating = (
            result[
                "average_rating"
            ]
        )

        current_result.rating_component = (
            result[
                "rating_component"
            ]
        )

        current_result.positive_sentiment_percentage = (
            result[
                "positive_sentiment_percentage"
            ]
        )

        current_result.negative_sentiment_percentage = (
            result[
                "negative_sentiment_percentage"
            ]
        )

        current_result.theme_count = (
            result[
                "theme_count"
            ]
        )

        current_result.aspect_count = (
            result[
                "aspect_count"
            ]
        )

        current_result.positive_aspect_count = (
            result[
                "positive_aspect_count"
            ]
        )

        current_result.negative_aspect_count = (
            result[
                "negative_aspect_count"
            ]
        )

        current_result.positive_aspect_percentage = (
            result[
                "positive_aspect_percentage"
            ]
        )

        current_result.negative_aspect_percentage = (
            result[
                "negative_aspect_percentage"
            ]
        )

        current_result.theme_component = (
            result[
                "theme_component"
            ]
        )

        current_result.moodscore = (
            result[
                "moodscore"
            ]
        )

        current_result.overall_sentiment = (
            result[
                "overall_sentiment"
            ]
        )

        current_result.updated_at = (
            calculated_at
        )

    history_result = (
        BusinessMoodScoreHistory(
            business_id=business_id,
            eligible_review_count=(
                result[
                    "eligible_review_count"
                ]
            ),
            positive_review_count=(
                result[
                    "positive_review_count"
                ]
            ),
            negative_review_count=(
                result[
                    "negative_review_count"
                ]
            ),
            average_rating=(
                result[
                    "average_rating"
                ]
            ),
            rating_component=(
                result[
                    "rating_component"
                ]
            ),
            positive_sentiment_percentage=(
                result[
                    "positive_sentiment_percentage"
                ]
            ),
            negative_sentiment_percentage=(
                result[
                    "negative_sentiment_percentage"
                ]
            ),
            theme_count=(
                result[
                    "theme_count"
                ]
            ),
            aspect_count=(
                result[
                    "aspect_count"
                ]
            ),
            positive_aspect_count=(
                result[
                    "positive_aspect_count"
                ]
            ),
            negative_aspect_count=(
                result[
                    "negative_aspect_count"
                ]
            ),
            positive_aspect_percentage=(
                result[
                    "positive_aspect_percentage"
                ]
            ),
            negative_aspect_percentage=(
                result[
                    "negative_aspect_percentage"
                ]
            ),
            theme_component=(
                result[
                    "theme_component"
                ]
            ),
            moodscore=(
                result[
                    "moodscore"
                ]
            ),
            overall_sentiment=(
                result[
                    "overall_sentiment"
                ]
            ),
            calculated_at=(
                calculated_at
            )
        )
    )

    db.add(
        history_result
    )

    db.flush()

    return True