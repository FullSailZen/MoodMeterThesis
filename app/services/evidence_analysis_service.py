"""
Handles multimodal evidence analysis for MoodMeter.
"""

import base64
import os

from dotenv import load_dotenv
from openai import OpenAI

from app.schemas.evidence import EvidenceAnalysisResult


load_dotenv()

client = OpenAI()


def encode_image(
    image_bytes: bytes,
    content_type: str
) -> str:
    encoded_image = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    return (
        f"data:{content_type};base64,"
        f"{encoded_image}"
    )


def analyze_evidence(
    receipt_bytes: bytes,
    receipt_content_type: str,
    purchase_images: list[
        tuple[bytes, str]
    ]
) -> EvidenceAnalysisResult:

    receipt_image = encode_image(
        receipt_bytes,
        receipt_content_type
    )


    content = [
        {
            "type": "input_text",
            "text": (
                "Analyze the submitted MoodMeter evidence. "
                "The first image is the receipt. "
                "The remaining images are photos of the product "
                "being reviewed and may show different angles "
                "or a visible barcode. "

                "Extract the business information, transaction "
                "information, and purchased items from the receipt. "

                "Then determine which purchased item on the receipt "
                "corresponds to the product shown in the purchase "
                "photos. "

                "Set purchase_photo_matches_receipt to true only "
                "when the photographed product can reasonably be "
                "associated with an item on the receipt. "

                "When a match is found, return that receipt item's "
                "name in matched_purchase_item_name and its UPC in "
                "matched_purchase_item_upc. "

                "If a barcode on the product photo is clearer than "
                "the receipt barcode and clearly belongs to the "
                "same matched product, it may be used for "
                "matched_purchase_item_upc. "

                "Do not return the UPC of an unrelated receipt item. "

                "If the reviewed product cannot be identified, "
                "set matched_purchase_item_name and "
                "matched_purchase_item_upc to null. "

                "Extract only information that can be reasonably "
                "identified from the submitted evidence. "
                "Do not guess missing information."
            )
        },
        {
            "type": "input_image",
            "image_url": receipt_image,
            "detail": "high"
        }
    ]


    for (
        image_bytes,
        content_type
    ) in purchase_images:

        purchase_image = encode_image(
            image_bytes,
            content_type
        )

        content.append(
            {
                "type": "input_image",
                "image_url": purchase_image,
                "detail": "high"
            }
        )


    response = client.responses.create(
        model=os.getenv(
            "OPENAI_MODEL",
            "gpt-5.6-luna"
        ),
        store=False,
        input=[
            {
                "role": "user",
                "content": content
            }
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": (
                    "moodmeter_evidence_analysis"
                ),
                "strict": True,
                "schema": (
                    EvidenceAnalysisResult
                    .model_json_schema()
                )
            }
        }
    )


    return (
        EvidenceAnalysisResult
        .model_validate_json(
            response.output_text
        )
    )