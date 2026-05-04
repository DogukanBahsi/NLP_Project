from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/hotels",
    tags=["Hotels"]
)


@router.post("/", response_model=schemas.HotelResponse)
def create_hotel(hotel: schemas.HotelCreate, db: Session = Depends(get_db)):
    new_hotel = models.Hotel(
        name=hotel.name,
        city=hotel.city,
        country=hotel.country
    )

    db.add(new_hotel)
    db.commit()
    db.refresh(new_hotel)

    return new_hotel


@router.get("/", response_model=List[schemas.HotelResponse])
def get_hotels(db: Session = Depends(get_db)):
    hotels = db.query(models.Hotel).all()
    return hotels   