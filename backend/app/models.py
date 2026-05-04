from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("Review", back_populates="hotel")


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

    created_at = Column(DateTime, default=datetime.utcnow)

    hotel = relationship("Hotel", back_populates="reviews")