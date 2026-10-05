def normalize_text(value: str | None) -> str:
    if value is None:
        return ""

    return value.lower().strip()


def compare_business_information(
    selected_name: str,
    selected_address: str,
    selected_city: str,
    selected_state: str,
    returned_name: str | None,
    returned_address: str | None,
    returned_city: str | None,
    returned_state: str | None
) -> dict:

    name_match = (
        normalize_text(selected_name)
        == normalize_text(returned_name)
    )

    address_match = (
        normalize_text(selected_address)
        == normalize_text(returned_address)
    )

    city_match = (
        normalize_text(selected_city)
        == normalize_text(returned_city)
    )

    state_match = (
        normalize_text(selected_state)
        == normalize_text(returned_state)
    )

    business_match = (
        name_match
        and address_match
        and city_match
        and state_match
    )

    return {
        "business_match": business_match,
        "name_match": name_match,
        "address_match": address_match,
        "city_match": city_match,
        "state_match": state_match
    }