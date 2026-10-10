"""
Handles AI sentiment and theme analysis for verified reviews.
"""

import os

from dotenv import load_dotenv
from openai import OpenAI

from app.schemas.sentiment import (
    SentimentAnalysisResult
)


load_dotenv()

client = OpenAI()


def analyze_review_sentiment(
    review_text: str,
    rating: int
) -> SentimentAnalysisResult:

    response = client.responses.create(
        model=os.getenv(
            "OPENAI_MODEL",
            "gpt-5.6-luna"
        ),
        store=False,
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": (
                            "Analyze the following verified "
                            "MoodMeter customer review.\n\n"

                            "The review has already been "
                            "verified as evidence-supported "
                            "patronage. Verification does not "
                            "mean the opinions or claims in the "
                            "review are automatically true.\n\n"

                            "Use BOTH the customer's numeric "
                            "rating and written review when "
                            "determining the overall sentiment. "
                            "Do not invent facts that are not "
                            "present in the review.\n\n"

                            "The numeric rating represents the "
                            "reviewer's overall evaluation of "
                            "the business. The written review "
                            "provides more detailed information "
                            "about specific positive and "
                            "negative aspects.\n\n"

                            "Overall sentiment must be either "
                            "positive or negative.\n\n"

                            "Use these guidelines when deciding "
                            "overall sentiment:\n"
                            "- A 4 or 5 star review should "
                            "normally be classified as positive.\n"
                            "- A 1 or 2 star review should "
                            "normally be classified as negative.\n"
                            "- A 3 star review should rely more "
                            "heavily on the written review.\n"
                            "- A 4 or 5 star review may still be "
                            "classified as negative only when "
                            "the written review is clearly and "
                            "predominantly negative despite the "
                            "high rating.\n"
                            "- A 1 or 2 star review may still be "
                            "classified as positive only when "
                            "the written review is clearly and "
                            "predominantly positive despite the "
                            "low rating.\n"
                            "- Do not classify the entire review "
                            "as negative merely because it "
                            "contains some negative aspects when "
                            "the overall rating and tone are "
                            "positive.\n"
                            "- Do not classify the entire review "
                            "as positive merely because it "
                            "contains some positive aspects when "
                            "the overall rating and tone are "
                            "negative.\n\n"

                            "Identify the main themes discussed "
                            "in the written review. Themes should "
                            "be short descriptive phrases such "
                            "as 'customer service', "
                            "'food quality', 'price', "
                            "'wait time', 'parking', "
                            "'store selection', or "
                            "'product quality'.\n\n"

                            "Also identify individual aspects "
                            "mentioned in the written review and "
                            "assign each aspect either positive "
                            "or negative sentiment.\n\n"

                            "Aspect sentiment is independent "
                            "from overall sentiment. A review "
                            "with an overall positive sentiment "
                            "may still contain negative aspects, "
                            "and an overall negative review may "
                            "still contain positive aspects.\n\n"

                            "Do not include an aspect or theme "
                            "unless it is actually supported by "
                            "the written review.\n\n"

                            f"Customer rating: {rating}/5\n\n"

                            "Review text:\n"
                            f"{review_text}"
                        )
                    }
                ]
            }
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": (
                    "moodmeter_sentiment_analysis"
                ),
                "strict": True,
                "schema": (
                    SentimentAnalysisResult
                    .model_json_schema()
                )
            }
        }
    )

    return (
        SentimentAnalysisResult
        .model_validate_json(
            response.output_text
        )
    )