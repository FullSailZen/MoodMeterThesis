from sqlalchemy.orm import Session

from app.db.models import Business
from app.services.business_verification_service import (
    compare_business_addresses,
    compare_business_names,
    normalize_text
)


def get_or_create_business(
    db: Session,
    name: str,
    address: str,
    city: str,
    state: str
) -> Business:
    name = name.strip()
    address = address.strip()
    city = city.strip()
    state = state.strip().upper()

    candidate_businesses = (
        db.query(Business)
        .filter(
            Business.city.ilike(city),
            Business.state.ilike(state)
        )
        .all()
    )

    for business in candidate_businesses:
        name_match = compare_business_names(
            name,
            business.name
        )

        address_match = compare_business_addresses(
            address,
            business.address
        )

        city_match = (
            normalize_text(city)
            == normalize_text(business.city)
        )

        state_match = (
            normalize_text(state)
            == normalize_text(business.state)
        )

        if (
            name_match
            and address_match
            and city_match
            and state_match
        ):
            return business

    business = Business(
        name=name,
        address=address,
        city=city,
        state=state,
        phone=""
    )

    db.add(business)
    db.flush()

    return business