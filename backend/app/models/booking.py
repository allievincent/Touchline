from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# this is the table that connects users and sessions (many to many)
class Booking(Base):
    __tablename__ = "bookings"
    # a player can only book the same session once
    __table_args__ = (UniqueConstraint("user_id", "session_id", name="one_booking_per_session"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    session_id: Mapped[int] = mapped_column(ForeignKey("training_sessions.id"))
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    user: Mapped["User"] = relationship(back_populates="bookings")
    session: Mapped["TrainingSession"] = relationship(back_populates="bookings")
