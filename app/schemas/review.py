from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    business_id: int
    body: str
    rating: int = Field(ge=1, le=5)