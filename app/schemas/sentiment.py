from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict
)


class SentimentAspect(BaseModel):
    model_config = ConfigDict(
        extra="forbid"
    )

    aspect: str

    sentiment: Literal[
        "positive",
        "negative"
    ]


class SentimentAnalysisResult(BaseModel):
    model_config = ConfigDict(
        extra="forbid"
    )

    sentiment: Literal[
        "positive",
        "negative"
    ]

    themes: list[str]

    aspects: list[
        SentimentAspect
    ]