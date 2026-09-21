"""
Handles multimodal evidence analysis for MoodMeter.
"""
import base64
import os

from openai import OpenAI

from app.schemas.evidence import EvidenceAnalysisResult

from dotenv import load_dotenv

load_dotenv()


client = OpenAI()

def encode_image(image_bytes: bytes, content_type: str) -> str:
    """
    Convert image bytes into a base64 data URL so it can safely live 
    inside a text-based request like JSON and be sent to OpenAI.
    """

    encoded_image = base64.b64encode(image_bytes).decode("utf-8")

    return f"data:{content_type};base64,{encoded_image}"

def analyze_evidence(
    receipt_bytes: bytes,
    receipt_content_type: str,
    purchase_images: list[tuple[bytes, str]]) -> EvidenceAnalysisResult:
    """
    Analyze receipt and purchase evidence using OpenAI.
    """

    receipt_image = encode_image(
        receipt_bytes,
        receipt_content_type,
    )

    content = [
        {
            "type": "input_text",
            "text": (
                "Analyze the submitted MoodMeter evidence. "
                "The first image is a receipt. The remaining images are "
                "photos of the purchased item or items and may include "
                "different angles or a visible barcode. "
                "Extract only information that can be reasonably "
                "identified from the evidence. Do not guess missing "
                "information."
            ),
        },
        {
            "type": "input_image",
            "image_url": receipt_image,
            "detail": "high",
        },
    ]

    for image_bytes, content_type in purchase_images:
        purchase_image = encode_image(
            image_bytes,
            content_type,
        )

        content.append(
            {
                "type": "input_image",
                "image_url": purchase_image,
                "detail": "high",
            }
        )

    response = client.responses.create(
        model=os.getenv("OPENAI_MODEL", "gpt-5.6-luna"),
        store=False,
        input=[
            {
                "role": "user",
                "content": content,
            }
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "moodmeter_evidence_analysis",
                "strict": True,
                "schema": EvidenceAnalysisResult.model_json_schema(),
            }
        },
    )

    return EvidenceAnalysisResult.model_validate_json(
        response.output_text
    )