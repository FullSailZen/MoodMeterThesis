from app.schemas.evidence import EvidenceAnalysisResult


def evaluate_transaction_and_product_information(
    evidence_result: EvidenceAnalysisResult,
    product_comparisons: list[dict]
) -> dict:

    transaction_date_present = (
        evidence_result.transaction_date is not None
    )

    transaction_total_present = (
        evidence_result.total_amount is not None
    )

    purchased_items_present = (
        len(evidence_result.purchased_items) > 0
    )

    external_product_data_available = any(
        comparison.get("external_data_available", False)
        for comparison in product_comparisons
    )

    if external_product_data_available:
        product_match = any(
            comparison.get("product_match", False)
            for comparison in product_comparisons
        )
    else:
        product_match = None

    return {
        "transaction_date_present": transaction_date_present,
        "transaction_total_present": transaction_total_present,
        "purchased_items_present": purchased_items_present,
        "external_product_data_available": external_product_data_available,
        "product_match": product_match
    }