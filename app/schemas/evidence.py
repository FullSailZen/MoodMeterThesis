from pydantic import BaseModel, ConfigDict, Field


class PurchasedItem(BaseModel):
    """Represents an individual item identified on a receipt."""

    model_config = ConfigDict(extra="forbid")
    name: str | None
    upc: str | None
    quantity: float | None
    unit_price: float | None
    line_total: float | None


class EvidenceAnalysisResult(BaseModel):
    """Represents the structured result of evidence analysis."""

    model_config = ConfigDict(extra="forbid")

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

    purchased_items: list[PurchasedItem]

    receipt_readable: bool

    purchase_photo_description: str | None
    purchase_photo_matches_receipt: bool | None

    confidence_score: float = Field(ge=0.0, le=1.0)

    notes: list[str]