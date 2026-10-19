from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import booking_crud, session_crud
from app.dependencies import get_current_user
from app.models import User, Booking
from app.schemas.booking import BookingCreate, BookingOut

router = APIRouter(prefix="/bookings", tags=["Bookings"])


class NoteUpdate(BaseModel):
    note: str | None = Field(default=None, max_length=255)


def get_my_booking(db: Session, booking_id: int, user: User) -> Booking:
    booking = booking_crud.get(db, booking_id)
    if not booking or booking.user_id != user.id:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.get("/me", response_model=list[BookingOut])
def my_bookings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return booking_crud.get_for_user(db, user)


@router.post("/", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def book_session(data: BookingCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    session = session_crud.get(db, data.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.coach_id == user.id:
        raise HTTPException(status_code=400, detail="You can't book your own session")
    if session.start_time < datetime.now():
        raise HTTPException(status_code=400, detail="This session already happened")
    if booking_crud.find(db, user, session):
        raise HTTPException(status_code=400, detail="You're already booked for this session")
    if session.spots_left <= 0:
        raise HTTPException(status_code=400, detail="Sorry, this session is full")
    return booking_crud.create(db, user, session, data.note)


@router.put("/{booking_id}", response_model=BookingOut)
def update_booking(booking_id: int, data: NoteUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = get_my_booking(db, booking_id, user)
    return booking_crud.update_note(db, booking, data.note)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(booking_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = get_my_booking(db, booking_id, user)
    booking_crud.delete(db, booking)
