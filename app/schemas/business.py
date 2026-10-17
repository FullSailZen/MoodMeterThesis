from datetime import datetime

from pydantic import BaseModel


class BusinessReviewResponse(BaseModel):
    id: int
    rating: int
    body: str
    verification_status: str
    sentiment: str | None
    created_at: datetime


class BusinessSummaryResponse(BaseModel):
    id: int
    name: str
    address: str
    city: str
    state: str
    average_rating: float | None
    review_count: int
    verified_review_count: int
    verified_percentage: float


class BusinessProfileResponse(BaseModel):
    id: int
    name: str
    address: str
    city: str
    state: str
    average_rating: float | None
    review_count: int
    verified_review_count: int
    verified_percentage: float
    reviews: list[
        BusinessReviewResponse
    ]


class BusinessReviewSummaryResponse(BaseModel):
    review_count: int
    summary: str
    overall_sentiment: str
    positive_themes: list[str]
    negative_themes: list[str]
    recurring_themes: list[str]


class BusinessMoodScoreResponse(BaseModel):
    business_id: int

    eligible_review_count: int

    positive_review_count: int
    negative_review_count: int

    average_rating: float | None

    rating_component: float | None

    positive_sentiment_percentage: (
        float | None
    )

    negative_sentiment_percentage: (
        float | None
    )

    theme_count: int

    aspect_count: int

    positive_aspect_count: int
    negative_aspect_count: int

    positive_aspect_percentage: (
        float | None
    )

    negative_aspect_percentage: (
        float | None
    )

    theme_component: float | None

    moodscore: float | None

    overall_sentiment: str


class BusinessMoodScoreHistoryResponse(BaseModel):
    id: int
    business_id: int

    eligible_review_count: int

    positive_review_count: int
    negative_review_count: int

    average_rating: float

    rating_component: float

    positive_sentiment_percentage: float
    negative_sentiment_percentage: float

    theme_count: int

    aspect_count: int

    positive_aspect_count: int
    negative_aspect_count: int

    positive_aspect_percentage: (
        float | None
    )

    negative_aspect_percentage: (
        float | None
    )

    theme_component: float | None

    moodscore: float

    overall_sentiment: str

    calculated_at: datetime


class BusinessMoodScoreVisualizationResponse(
    BaseModel
):
    business_id: int
    record_count: int

    dates: list[datetime]

    moodscores: list[float]

    average_ratings: list[float]

    positive_sentiment_percentages: (
        list[float]
    )

    negative_sentiment_percentages: (
        list[float]
    )

    overall_sentiments: list[str]

    eligible_review_counts: list[int]