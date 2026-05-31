from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id          = Column(Integer, primary_key=True, index=True)
    username    = Column(String, unique=True, nullable=False, index=True)
    email       = Column(String, unique=True, nullable=False, index=True)
    hashed_pw   = Column(String, nullable=False)
    is_active   = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)  # e-posta doğrulandı mı
    created_at  = Column(DateTime, default=datetime.utcnow)


class EmailVerification(Base):
    """E-posta doğrulama kodları — 10 dk geçerli, tek kullanımlık."""
    __tablename__ = "email_verifications"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    code       = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used       = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Hotel(Base):
    __tablename__ = "hotels"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    city          = Column(String, nullable=True)
    country       = Column(String, nullable=True)
    google_rating = Column(Float,  nullable=True)
    place_id      = Column(String, nullable=True)   # Google Maps place_id
    latitude      = Column(Float,  nullable=True)   # GPS
    longitude     = Column(Float,  nullable=True)
    address       = Column(String, nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow)

    reviews          = relationship("Review", back_populates="hotel")
    external_ratings = relationship("ExternalRating", back_populates="hotel",
                                    cascade="all, delete-orphan")


class ExternalRating(Base):
    """Tripadvisor, Booking, Expedia vb. dış platformlardan manuel girilen puanlar."""
    __tablename__ = "external_ratings"

    id           = Column(Integer, primary_key=True, index=True)
    hotel_id     = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    platform     = Column(String, nullable=False)   # "tripadvisor", "booking", ...
    rating       = Column(Float,  nullable=True)    # örn. 4.3
    max_rating   = Column(Float,  nullable=True)    # örn. 5.0 / 10.0
    review_count = Column(Integer, nullable=True)
    url          = Column(String, nullable=True)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hotel = relationship("Hotel", back_populates="external_ratings")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)

    hotel_id = Column(Integer, ForeignKey("hotels.id"))
    source = Column(String, default="manual")

    reviewer_name = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    comment = Column(Text, nullable=False)

    sentiment = Column(String, nullable=True)
    satisfaction_score = Column(Float, nullable=True)
    issue_category = Column(String, nullable=True)
    risk_score = Column(Float, nullable=True)
    action_suggestion = Column(Text, nullable=True)

    review_date = Column(DateTime, nullable=True)
    review_date_raw = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    hotel = relationship("Hotel", back_populates="reviews")