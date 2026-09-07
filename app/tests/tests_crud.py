from sqlalchemy import select

from app.db.database import SessionLocal
from app.db.models import User


def test_crud():
    with SessionLocal() as session:

        # CREATE
        user = User(name="CRUD Test User")
        session.add(user)
        session.commit()
        session.refresh(user)

        print(f"CREATE: User {user.id} - {user.name}")


        # READ
        statement = select(User).where(User.id == user.id)
        retrieved_user = session.scalar(statement)

        print(f"READ: User {retrieved_user.id} - {retrieved_user.name}")


        # UPDATE
        retrieved_user.name = "Updated CRUD User"
        session.commit()
        session.refresh(retrieved_user)

        print(f"UPDATE: User {retrieved_user.id} - {retrieved_user.name}")


        # DELETE
        session.delete(retrieved_user)
        session.commit()

        deleted_user = session.scalar(
            select(User).where(User.id == user.id)
        )

        print(f"DELETE: {deleted_user}")


if __name__ == "__main__":
    test_crud()