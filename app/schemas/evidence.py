from pydantic import (
    BaseModel,
    ConfigDict,
    Field
)


class PurchasedItem(BaseModel):
    model_config = ConfigDict(
        extra="forbid"
    )

    name: str | None
    upc: str | None
    quantity: float | None
    unit_price: float | None
    line_total: float | None


class EvidenceAnalysisResult(BaseModel):
    model_config = ConfigDict(
        extra="forbid"
    )

    business_name: str | None
    street_address: str | None
    city: str | None
    state: str | None
    postal_code: str | None

    transaction_date: str | None
    transaction_time: str | None
    receipt_number: str | None

    total_amount: float | None
    currency: str | None

    purchased_items: list[
        PurchasedItem
    ]

    receipt_readable: bool

    purchase_photo_description: str | None

    purchase_photo_matches_receipt: (
        bool | None
    )

    matched_purchase_item_name: (
        str | None
    )

    matched_purchase_item_upc: (
        str | None
    )

    confidence_score: float = Field(
        ge=0.0,
        le=1.0
    )

    notes: list[str]


class VerificationChecks(BaseModel):
    business_match: bool
    product_match: bool | None
    transaction_date_present: bool
    duplicate_evidence: bool
    receipt_readable: bool


class BusinessComparisonResult(BaseModel):
    business_match: bool
    name_match: bool
    address_match: bool
    city_match: bool
    state_match: bool


class EvidenceEvaluationResult(BaseModel):
    transaction_date_present: bool
    transaction_total_present: bool
    purchased_items_present: bool
    external_product_data_available: bool
    product_match: bool | None


class SentimentAspectResult(BaseModel):
    aspect: str
    sentiment: str


class EvidenceSubmissionResult(BaseModel):
    review_id: int
    verification_status: str

    analysis: EvidenceAnalysisResult

    business_comparison: (
        BusinessComparisonResult
    )

    evidence_evaluation: (
        EvidenceEvaluationResult
    )

    duplicate_evidence: bool

    verification_checks: (
        VerificationChecks
    )

    sentiment_status: str

    sentiment: str | None

    sentiment_themes: list[str]

    sentiment_aspects: list[
        SentimentAspectResult
    ]

    sentiment_message: str