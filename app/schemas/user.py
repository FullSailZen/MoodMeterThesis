from datetime import datetime

from pydantic import BaseModel


class UserReviewResponse(BaseModel):
    id: int
    business_id: int
    business_name: str
    business_city: str
    business_state: str
    rating: int
    body: str
    verification_status: str
    created_at: datetime


class UserProfileResponse(BaseModel):
    id: int
    name: str
    role: str
    created_at: datetime
    auth_provider: str
    total_reviews: int
    verified_reviews: int
    unverified_reviews: int
    average_rating: float | None
    reviews: list[UserReviewResponse]