"""
Auth Router: Kayıt, giriş, kullanıcı bilgisi ve çıkış endpoint'leri.

POST /auth/register  → yeni kullanıcı oluşturur
POST /auth/login     → JWT token döner
GET  /auth/me        → mevcut kullanıcı bilgisini döner (token gerekli)
POST /auth/logout    → client-side token silme; backend sadece 200 döner
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz veya süresi dolmuş token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanıcı bulunamadı")
    return user


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten alınmış")

    user = User(
        username=body.username,
        email=body.email,
        hashed_pw=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    # E-posta veya kullanıcı adıyla giriş desteklenir
    user = (
        db.query(User).filter(User.email == body.email).first()
        or db.query(User).filter(User.username == body.email).first()
    )
    if not user or not verify_password(body.password, user.hashed_pw):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hesap devre dışı")

    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout():
    # JWT stateless; client token'ı siler, backend sadece onay döner
    return {"message": "Çıkış yapıldı"}
