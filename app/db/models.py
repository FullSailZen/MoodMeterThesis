from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime, Integer, CheckConstraint, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    google_sub: Mapped[str | None] = mapped_column(nullable=True, unique=True) #optional during dev
    name: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(20), default="consumer")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

class Business(Base):
    __tablename__ = "businesses"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    address: Mapped[str] = mapped_column(String(100))
    city: Mapped[str] = mapped_column(String(50))
    state: Mapped[str] = mapped_column(String(50))
    phone: Mapped[str] = mapped_column(String(20))

class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"))
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    body: Mapped[str] = mapped_column(Text)
    rating: Mapped[int] = mapped_column(Integer)
    __table_args__ = (CheckConstraint(
        "rating >= 1 AND rating <= 5",
        name="check_review_rating_range"),)
    verification_status: Mapped[str] = mapped_column(String(20), default="unverified")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

class SentimentResult(Base):
    __tablename__ = "sentiment_results"

    id: Mapped[int] = mapped_column(primary_key=True)
    review_id: Mapped[int] = mapped_column(ForeignKey("reviews.id"))
    sentiment: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

class ReviewEvidence(Base):
    __tablename__ = "review_evidence"

    id: Mapped[int] = mapped_column(primary_key=True)
    review_id: Mapped[int] = mapped_column(
        ForeignKey("reviews.id", ondelete="CASCADE"),
        unique=True
    )
    analysis_result: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now
    )


class EvidenceFile(Base):
    __tablename__ = "evidence_files"

    id: Mapped[int] = mapped_column(primary_key=True)
    evidence_id: Mapped[int] = mapped_column(
        ForeignKey("review_evidence.id", ondelete="CASCADE")
    )
    file_type: Mapped[str] = mapped_column(String(20))
    file_path: Mapped[str] = mapped_column(String(500))
    content_type: Mapped[str] = mapped_column(String(100))
    sha256_hash: Mapped[str] = mapped_column(
        String(64),
        index=True
    )
    is_duplicate: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now
    )
    __table_args__ = (
        CheckConstraint(
            "file_type IN ('receipt', 'purchase')",
            name="check_evidence_file_type"
        ),
    )