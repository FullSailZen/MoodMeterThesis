from difflib import SequenceMatcher


def normalize_text(value: str | None) -> str:
    if value is None:
        return ""

    return value.lower().strip()


def calculate_name_similarity(
    receipt_name: str | None,
    external_title: str | None
) -> float:

    receipt_text = normalize_text(receipt_name)
    external_text = normalize_text(external_title)

    if not receipt_text or not external_text:
        return 0.0

    return SequenceMatcher(
        None,
        receipt_text,
        external_text
    ).ratio()


def compare_product_information(
    receipt_item: dict,
    external_product: dict | None
) -> dict:

    if external_product is None:
        return {
            "external_data_available": False,
            "upc_match": None,
            "name_similarity": None,
            "product_match": False
        }

    if external_product.get("status") != "found":
        return {
            "external_data_available": False,
            "upc_match": None,
            "name_similarity": None,
            "product_match": False
        }

    receipt_upc = receipt_item.get("upc")
    external_upc = external_product.get("upc")

    upc_match = (
        receipt_upc is not None
        and external_upc is not None
        and receipt_upc == external_upc
    )

    name_similarity = calculate_name_similarity(
        receipt_item.get("name"),
        external_product.get("title")
    )

    product_match = (
        upc_match
        or name_similarity >= 0.70
    )

    return {
        "external_data_available": True,
        "upc_match": upc_match,
        "name_similarity": round(name_similarity, 3),
        "product_match": product_match
    }