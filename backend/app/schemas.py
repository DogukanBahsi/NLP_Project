from pydantic import BaseModel, EmailStr, field_validator
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


# ── Auth Schemas ─────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    password_confirm: str

    @field_validator("username")
    @classmethod
    def username_length(cls, v: str) -> str:
        if len(v.strip()) < 3:
            raise ValueError("Kullanıcı adı en az 3 karakter olmalı")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Şifre en az 6 karakter olmalı")
        return v

    @field_validator("password_confirm")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Şifreler eşleşmiyor")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


TokenResponse.model_rebuild()