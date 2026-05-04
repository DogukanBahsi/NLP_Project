from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class HotelCreate(BaseModel):
    name: str
    city: Optional[str] = None
    country: Optional[str] = None


class HotelResponse(BaseModel):
    id: int
    name: str
    city: Optional[str]
    country: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    hotel_id: int
    source: Optional[str] = "manual"
    reviewer_name: Optional[str] = None
    rating: Optional[float] = None
    comment: str


class ReviewResponse(BaseModel):
    id: int
    hotel_id: int
    source: str
    reviewer_name: Optional[str]
    rating: Optional[float]
    comment: str

    sentiment: Optional[str]
    satisfaction_score: Optional[float]
    issue_category: Optional[str]
    risk_score: Optional[float]
    action_suggestion: Optional[str]

    created_at: datetime

    class Config:
        from_attributes = True
        
class TextAnalysisRequest(BaseModel):
    comment: str
    model_type: str = "ml"