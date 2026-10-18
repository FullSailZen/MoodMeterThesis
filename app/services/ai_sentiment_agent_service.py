"""
Generates grounded answers from retrieved MoodMeter reviews.
"""

import os

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()

client = OpenAI()


OPENAI_MODEL = os.getenv(
    "OPENAI_MODEL",
    "gpt-5.6-luna"
)


MINIMUM_SUPPORT_SIMILARITY = 0.30


def filter_supported_reviews(
    reviews: list[dict]
) -> list[dict]:

    return [
        review
        for review in reviews
        if (
            review["similarity"]
            >= MINIMUM_SUPPORT_SIMILARITY
        )
    ]


def build_review_context(
    reviews: list[dict]
) -> str:

    context_parts = []

    for review in reviews:

        context_parts.append(
            "\n".join(
                [
                    (
                        f"Review ID: "
                        f"{review['review_id']}"
                    ),
                    (
                        f"Rating: "
                        f"{review['rating']}/5"
                    ),
                    (
                        f"Semantic Similarity: "
                        f"{review['similarity']:.4f}"
                    ),
                    (
                        f"Verification Status: "
                        f"{review['verification_status']}"
                    ),
                    (
                        f"Review Text: "
                        f"{review['body']}"
                    )
                ]
            )
        )

    return "\n\n---\n\n".join(
        context_parts
    )


def generate_grounded_review_answer(
    business_name: str,
    question: str,
    reviews: list[dict]
) -> str:

    cleaned_question = (
        question.strip()
    )

    if not cleaned_question:
        raise ValueError(
            "Question cannot be empty."
        )

    if not reviews:
        raise ValueError(
            "No supported reviews were provided "
            "for answer generation."
        )

    review_context = (
        build_review_context(
            reviews
        )
    )

    instructions = (
        "You are the MoodMeter AI Sentiment "
        "Analysis Agent. Answer the user's "
        "question using only the verified "
        "MoodMeter reviews provided as context. "
        "Do not use outside knowledge. "
        "Do not invent details or infer facts "
        "that are not supported by the reviews. "
        "If the available reviews only partially "
        "answer the question, clearly state the "
        "limitation. "
        "If different reviews disagree, explain "
        "that the available feedback is mixed. "
        "Do not claim that a pattern is common "
        "unless more than one provided review "
        "supports that pattern. "
        "Keep the answer concise and directly "
        "focused on the user's question. "
        "Do not provide a separate source list "
        "because MoodMeter displays the supporting "
        "reviews separately."
    )

    user_input = (
        f"Business: {business_name}\n\n"
        f"User Question:\n"
        f"{cleaned_question}\n\n"
        f"Retrieved Verified Reviews:\n"
        f"{review_context}"
    )

    response = (
        client.responses.create(
            model=OPENAI_MODEL,
            instructions=(
                instructions
            ),
            input=(
                user_input
            )
        )
    )

    answer = (
        response.output_text
        .strip()
    )

    if not answer:
        raise ValueError(
            "OpenAI returned an empty "
            "agent response."
        )

    return answer