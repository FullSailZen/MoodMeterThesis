from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    business_name: str
    street_address: str
    city: str
    state: str
    body: str
    rating: int = Field(ge=1, le=5)