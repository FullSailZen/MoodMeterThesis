from pydantic import BaseModel, Field


class SemanticReviewResult(BaseModel):
    review_id: int
    rating: int
    body: str
    verification_status: str
    similarity: float


class SemanticReviewSearchRequest(BaseModel):
    question: str = Field(
        min_length=1
    )

    limit: int = Field(
        default=5,
        ge=1,
        le=10
    )


class SemanticReviewSearchResponse(BaseModel):
    business_id: int
    question: str
    answer: str
    supported: bool
    support_message: str
    result_count: int
    results: list[
        SemanticReviewResult
    ]