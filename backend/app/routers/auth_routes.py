"""
Auth Router:
  POST /auth/register        → kullanıcı oluştur, doğrulama kodu gönder
  POST /auth/verify-email    → kodu doğrula, hesabı aktifleştir, token döner
  POST /auth/login           → giriş yap, doğrulama kodu gönder
  POST /auth/verify-login    → kodu doğrula, JWT token döner
  GET  /auth/me              → mevcut kullanıcı bilgisi (token gerekli)
  POST /auth/logout          → client-side token silme
"""
import random
import string
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, EmailVerification
from app.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.core.email import send_verification_email

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/verify-login")

CODE_EXPIRE_MINUTES = 10


def _generate_code() -> str:
    return "".join(random.choices(string.digits, k=6))


def _create_verification(db: Session, user_id: int) -> str:
    # Önceki kodları geçersiz kıl
    db.query(EmailVerification).filter(
        EmailVerification.user_id == user_id,
        EmailVerification.used == False
    ).update({"used": True})
    db.commit()

    code = _generate_code()
    ev = EmailVerification(
        user_id=user_id,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=CODE_EXPIRE_MINUTES),
    )
    db.add(ev)
    db.commit()
    return code


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz veya süresi dolmuş token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanıcı bulunamadı")
    return user


# ── Kayıt ────────────────────────────────────────────────────────────────────

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten alınmış")

    user = User(
        username=body.username,
        email=body.email,
        hashed_pw=hash_password(body.password),
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    code = _create_verification(db, user.id)
    send_verification_email(user.email, user.username, code)

    return {"message": "Doğrulama kodu e-postanıza gönderildi", "email": user.email}


@router.post("/verify-email", response_model=TokenResponse)
def verify_email(email: str, code: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    ev = db.query(EmailVerification).filter(
        EmailVerification.user_id == user.id,
        EmailVerification.code == code,
        EmailVerification.used == False,
        EmailVerification.expires_at > datetime.utcnow(),
    ).first()

    if not ev:
        raise HTTPException(status_code=400, detail="Kod geçersiz veya süresi dolmuş")

    ev.used = True
    user.is_verified = True
    db.commit()

    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


# ── Giriş ────────────────────────────────────────────────────────────────────

@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User).filter(User.email == body.email).first()
        or db.query(User).filter(User.username == body.email).first()
    )
    if not user or not verify_password(body.password, user.hashed_pw):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hesap devre dışı")

    code = _create_verification(db, user.id)
    send_verification_email(user.email, user.username, code)

    return {"message": "Doğrulama kodu e-postanıza gönderildi", "email": user.email}


@router.post("/verify-login", response_model=TokenResponse)
def verify_login(email: str, code: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    ev = db.query(EmailVerification).filter(
        EmailVerification.user_id == user.id,
        EmailVerification.code == code,
        EmailVerification.used == False,
        EmailVerification.expires_at > datetime.utcnow(),
    ).first()

    if not ev:
        raise HTTPException(status_code=400, detail="Kod geçersiz veya süresi dolmuş")

    ev.used = True
    user.is_verified = True
    db.commit()

    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


# ── Diğer ────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout():
    return {"message": "Çıkış yapıldı"}
