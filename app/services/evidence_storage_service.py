import os

from pathlib import Path
from uuid import uuid4

import boto3


PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parents[2]
)

EVIDENCE_ROOT = (
    PROJECT_ROOT
    / "uploads"
    / "evidence"
)


ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
}


S3_BUCKET_NAME = os.getenv(
    "S3_BUCKET_NAME"
)

AWS_REGION = os.getenv(
    "AWS_REGION"
)


def using_s3() -> bool:

    return bool(
        S3_BUCKET_NAME
    )


def get_review_evidence_directory(
    review_id: int
) -> Path:

    review_directory = (
        EVIDENCE_ROOT
        / f"review_{review_id}"
    )

    review_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    return review_directory


def build_evidence_filename(
    file_type: str,
    content_type: str
) -> str:

    extension = (
        ALLOWED_IMAGE_TYPES.get(
            content_type
        )
    )

    if extension is None:
        raise ValueError(
            "Unsupported image content type"
        )

    return (
        f"{file_type}_"
        f"{uuid4().hex}"
        f"{extension}"
    )


def save_evidence_file_locally(
    review_id: int,
    filename: str,
    file_bytes: bytes
) -> str:

    review_directory = (
        get_review_evidence_directory(
            review_id
        )
    )

    file_path = (
        review_directory
        / filename
    )

    file_path.write_bytes(
        file_bytes
    )

    return (
        file_path
        .relative_to(
            PROJECT_ROOT
        )
        .as_posix()
    )


def save_evidence_file_to_s3(
    review_id: int,
    filename: str,
    file_bytes: bytes,
    content_type: str
) -> str:

    if not S3_BUCKET_NAME:
        raise RuntimeError(
            "S3 bucket is not configured"
        )

    object_key = (
        f"evidence/"
        f"review_{review_id}/"
        f"{filename}"
    )


    client_options = {}

    if AWS_REGION:
        client_options[
            "region_name"
        ] = AWS_REGION


    s3_client = boto3.client(
        "s3",
        **client_options
    )


    s3_client.put_object(
        Bucket=(
            S3_BUCKET_NAME
        ),
        Key=(
            object_key
        ),
        Body=(
            file_bytes
        ),
        ContentType=(
            content_type
        )
    )


    return object_key


def save_evidence_file(
    review_id: int,
    file_type: str,
    file_bytes: bytes,
    content_type: str | None
) -> str:

    if file_type not in {
        "receipt",
        "purchase"
    }:
        raise ValueError(
            "Invalid evidence file type"
        )

    if content_type is None:
        raise ValueError(
            "Missing image content type"
        )


    filename = (
        build_evidence_filename(
            file_type=(
                file_type
            ),
            content_type=(
                content_type
            )
        )
    )


    if using_s3():

        return (
            save_evidence_file_to_s3(
                review_id=(
                    review_id
                ),
                filename=(
                    filename
                ),
                file_bytes=(
                    file_bytes
                ),
                content_type=(
                    content_type
                )
            )
        )


    return (
        save_evidence_file_locally(
            review_id=(
                review_id
            ),
            filename=(
                filename
            ),
            file_bytes=(
                file_bytes
            )
        )
    )