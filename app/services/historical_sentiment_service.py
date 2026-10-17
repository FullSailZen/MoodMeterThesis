from app.db.models import (
    BusinessMoodScoreHistory
)


def organize_moodscore_history(
    business_id: int,
    history: list[
        BusinessMoodScoreHistory
    ]
) -> dict:

    dates = []
    moodscores = []
    average_ratings = []

    positive_sentiment_percentages = []
    negative_sentiment_percentages = []

    overall_sentiments = []

    eligible_review_counts = []

    for record in history:

        dates.append(
            record.calculated_at
        )

        moodscores.append(
            record.moodscore
        )

        average_ratings.append(
            record.average_rating
        )

        positive_sentiment_percentages.append(
            record
            .positive_sentiment_percentage
        )

        negative_sentiment_percentages.append(
            record
            .negative_sentiment_percentage
        )

        overall_sentiments.append(
            record.overall_sentiment
        )

        eligible_review_counts.append(
            record.eligible_review_count
        )

    return {
        "business_id":
            business_id,

        "record_count":
            len(history),

        "dates":
            dates,

        "moodscores":
            moodscores,

        "average_ratings":
            average_ratings,

        "positive_sentiment_percentages":
            positive_sentiment_percentages,

        "negative_sentiment_percentages":
            negative_sentiment_percentages,

        "overall_sentiments":
            overall_sentiments,

        "eligible_review_counts":
            eligible_review_counts
    }