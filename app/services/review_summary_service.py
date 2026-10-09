import json
import os

from openai import OpenAI

from app.schemas.business import BusinessReviewSummaryResponse


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


def generate_review_summary(
    business_name: str,
    reviews: list[dict]
) -> BusinessReviewSummaryResponse:

    review_count = len(reviews)

    if review_count < 3:
        return BusinessReviewSummaryResponse(
            review_count=review_count,
            summary=(
                "Not enough reviews are available to identify "
                "meaningful patterns yet."
            ),
            overall_sentiment="insufficient data",
            positive_themes=[],
            negative_themes=[],
            recurring_themes=[]
        )

    review_text = []

    for index, review in enumerate(
        reviews,
        start=1
    ):
        review_text.append(
            (
                f"Review {index}\n"
                f"Rating: {review['rating']}/5\n"
                f"Verification status: "
                f"{review['verification_status']}\n"
                f"Review text: {review['body']}"
            )
        )

    combined_reviews = "\n\n".join(
        review_text
    )

    prompt = f"""
You are analyzing customer reviews for MoodMeter.

Business:
{business_name}

Customer reviews:
{combined_reviews}

Create a concise summary based ONLY on the supplied reviews.

Important rules:

- Do not invent information.
- Do not assume something happened unless a review says it happened.
- A verified review means MoodMeter found evidence supporting patronage.
- Verified status does NOT mean the reviewer's opinions or claims are automatically true.
- Do not describe verified reviews as more truthful.
- Identify recurring themes only when more than one review supports the theme.
- Do not turn a single complaint or compliment into a general trend.
- Keep the main summary to approximately 2 to 4 sentences.
- Positive themes should contain short phrases.
- Negative themes should contain short phrases.
- Recurring themes should contain short phrases.
- If reviews disagree, reflect that disagreement.
- Overall sentiment must be one of:
  "positive",
  "mostly positive",
  "mixed",
  "mostly negative",
  "negative".

The summary is intended to help a consumer quickly understand what reviewers are saying.
"""

    response = client.responses.create(
        model=os.getenv(
            "OPENAI_MODEL",
            "gpt-5.6-luna"
        ),

        input=prompt,

        text={
            "format": {
                "type": "json_schema",
                "name": "business_review_summary",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "summary": {
                            "type": "string"
                        },
                        "overall_sentiment": {
                            "type": "string",
                            "enum": [
                                "positive",
                                "mostly positive",
                                "mixed",
                                "mostly negative",
                                "negative"
                            ]
                        },
                        "positive_themes": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },
                        "negative_themes": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },
                        "recurring_themes": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        }
                    },
                    "required": [
                        "summary",
                        "overall_sentiment",
                        "positive_themes",
                        "negative_themes",
                        "recurring_themes"
                    ],
                    "additionalProperties": False
                }
            }
        }
    )

    result = json.loads(
        response.output_text
    )

    return BusinessReviewSummaryResponse(
        review_count=review_count,
        summary=result["summary"],
        overall_sentiment=(
            result["overall_sentiment"]
        ),
        positive_themes=(
            result["positive_themes"]
        ),
        negative_themes=(
            result["negative_themes"]
        ),
        recurring_themes=(
            result["recurring_themes"]
        )
    )