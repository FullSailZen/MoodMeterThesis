import os

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import (
    DeclarativeBase,
    sessionmaker
)


load_dotenv()


def get_database_url():

    database_url = os.getenv(
        "DATABASE_URL"
    )

    if database_url:
        return database_url


    username = (
        os.getenv(
            "DB_USER"
        )
        or
        os.getenv(
            "RDS_USERNAME"
        )
    )

    password = (
        os.getenv(
            "DB_PASSWORD"
        )
        or
        os.getenv(
            "RDS_PASSWORD"
        )
    )

    host = (
        os.getenv(
            "DB_HOST"
        )
        or
        os.getenv(
            "RDS_HOSTNAME"
        )
    )

    port = (
        os.getenv(
            "DB_PORT"
        )
        or
        os.getenv(
            "RDS_PORT"
        )
        or
        "5432"
    )

    database = (
        os.getenv(
            "DB_NAME"
        )
        or
        os.getenv(
            "RDS_DB_NAME"
        )
    )


    missing = []

    if not username:
        missing.append(
            "database username"
        )

    if not password:
        missing.append(
            "database password"
        )

    if not host:
        missing.append(
            "database host"
        )

    if not database:
        missing.append(
            "database name"
        )


    if missing:
        raise RuntimeError(
            "Missing database configuration: "
            +
            ", ".join(
                missing
            )
        )


    return URL.create(
        drivername=(
            "postgresql+psycopg2"
        ),
        username=username,
        password=password,
        host=host,
        port=int(
            port
        ),
        database=database
    )


DATABASE_URL = (
    get_database_url()
)


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


SessionLocal = sessionmaker(
    bind=engine
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


class Base(
    DeclarativeBase
):
    pass