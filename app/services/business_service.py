from sqlalchemy.orm import Session

from app.db.models import Business


def get_or_create_business(
    db: Session,
    name: str,
    address: str,
    city: str,
    state: str
):
    business = (
        db.query(Business)
        .filter(
            Business.name == name,
            Business.address == address,
            Business.city == city,
            Business.state == state
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
    db.commit()
    db.refresh(business)

    return business