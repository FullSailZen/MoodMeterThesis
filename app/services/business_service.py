from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import Business


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

    business = (
        db.query(Business)
        .filter(
            func.lower(func.trim(Business.name)) == name.lower(),
            func.lower(func.trim(Business.address)) == address.lower(),
            func.lower(func.trim(Business.city)) == city.lower(),
            func.lower(func.trim(Business.state)) == state.lower()
        )
        .first()
    )

    if business:
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