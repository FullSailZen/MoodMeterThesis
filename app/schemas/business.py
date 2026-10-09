from datetime import datetime

from pydantic import BaseModel


class BusinessReviewResponse(BaseModel):
    id: int
    rating: int
    body: str
    verification_status: str
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
    reviews: list[BusinessReviewResponse]


class BusinessReviewSummaryResponse(BaseModel):
    review_count: int
    summary: str
    overall_sentiment: str
    positive_themes: list[str]
    negative_themes: list[str]
    recurring_themes: list[str]