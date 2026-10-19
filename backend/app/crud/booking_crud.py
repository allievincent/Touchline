from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Booking, TrainingSession, User


class BookingCRUD:
    """Database work for bookings (a player signing up for a session)."""

    def get(self, db: Session, booking_id: int) -> Booking | None:
        return db.get(Booking, booking_id)

    def get_for_user(self, db: Session, user: User) -> list[Booking]:
        query = (
            select(Booking)
            .join(TrainingSession)
            .where(Booking.user_id == user.id)
            .order_by(TrainingSession.start_time)
        )
        return list(db.scalars(query))

    def get_for_session(self, db: Session, session: TrainingSession) -> list[Booking]:
        return list(db.scalars(select(Booking).where(Booking.session_id == session.id).order_by(Booking.created_at)))

    def find(self, db: Session, user: User, session: TrainingSession) -> Booking | None:
        return db.scalar(select(Booking).where(Booking.user_id == user.id, Booking.session_id == session.id))

    def create(self, db: Session, user: User, session: TrainingSession, note: str | None = None) -> Booking:
        booking = Booking(user_id=user.id, session_id=session.id, note=note)
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    def update_note(self, db: Session, booking: Booking, note: str | None) -> Booking:
        booking.note = note
        db.commit()
        db.refresh(booking)
        return booking

    def delete(self, db: Session, booking: Booking) -> None:
        db.delete(booking)
        db.commit()


booking_crud = BookingCRUD()
