from datetime import datetime

from pydantic import (
    BaseModel,
    Field
)


class ReviewCreate(BaseModel):
    business_name: str
    street_address: str
    city: str
    state: str
    body: str

    rating: int = Field(
        ge=1,
        le=5
    )


class ReviewDetailBusiness(BaseModel):
    id: int
    name: str
    address: str
    city: str
    state: str


class ReviewDetailSentiment(BaseModel):
    sentiment: str
    themes: list[str]
    aspects: list[dict]


class ReviewDetailEvidence(BaseModel):
    analysis: dict

    business_comparison: dict

    duplicate_evidence: bool

    verification_checks: dict


class ReviewDetailResponse(BaseModel):
    id: int

    rating: int

    body: str

    verification_status: str

    created_at: datetime

    business: ReviewDetailBusiness

    sentiment: (
        ReviewDetailSentiment
        | None
    )

    evidence: (
        ReviewDetailEvidence
        | None
    )