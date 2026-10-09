from difflib import SequenceMatcher
import re


STREET_ABBREVIATIONS = {
    "street": "st",
    "road": "rd",
    "avenue": "ave",
    "drive": "dr",
    "boulevard": "blvd",
    "lane": "ln",
    "court": "ct",
    "place": "pl",
    "parkway": "pkwy",
    "highway": "hwy",
    "circle": "cir",
    "terrace": "ter",
    "trail": "trl",
    "way": "way",
    "north": "n",
    "south": "s",
    "east": "e",
    "west": "w"
}


def normalize_text(value: str | None) -> str:
    if value is None:
        return ""

    value = value.lower().strip()

    value = re.sub(
        r"[^\w\s]",
        " ",
        value
    )

    value = re.sub(
        r"\s+",
        " ",
        value
    )

    return value.strip()


def normalize_address(value: str | None) -> str:
    normalized = normalize_text(value)

    if not normalized:
        return ""

    words = normalized.split()

    normalized_words = [
        STREET_ABBREVIATIONS.get(
            word,
            word
        )
        for word in words
    ]

    return " ".join(
        normalized_words
    )


def compare_business_names(
    selected_name: str,
    returned_name: str | None
) -> bool:
    selected = normalize_text(
        selected_name
    )

    returned = normalize_text(
        returned_name
    )

    if not selected or not returned:
        return False

    if selected == returned:
        return True

    if (
        selected in returned
        or returned in selected
    ):
        return True

    similarity = SequenceMatcher(
        None,
        selected,
        returned
    ).ratio()

    return similarity >= 0.75


def compare_business_addresses(
    selected_address: str,
    returned_address: str | None
) -> bool:
    selected = normalize_address(
        selected_address
    )

    returned = normalize_address(
        returned_address
    )

    if not selected or not returned:
        return False

    if selected == returned:
        return True

    similarity = SequenceMatcher(
        None,
        selected,
        returned
    ).ratio()

    return similarity >= 0.90


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
    name_match = compare_business_names(
        selected_name,
        returned_name
    )

    address_match = compare_business_addresses(
        selected_address,
        returned_address
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