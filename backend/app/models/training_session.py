from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# called TrainingSession so it doesn't get confused with a database Session
class TrainingSession(Base):
    __tablename__ = "training_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(120))
    focus: Mapped[str] = mapped_column(String(40))  # Goalkeeping, Finishing, Passing, Fitness, Defending
    level: Mapped[str] = mapped_column(String(20))  # Beginner, Intermediate, Advanced
    description: Mapped[str] = mapped_column(Text, default="")
    location: Mapped[str] = mapped_column(String(120))
    start_time: Mapped[datetime] = mapped_column(DateTime, index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60)
    capacity: Mapped[int] = mapped_column(Integer, default=12)
    coach_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    coach: Mapped["User"] = relationship(back_populates="sessions")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="session", cascade="all, delete-orphan")

    @property
    def booked_count(self) -> int:
        return len(self.bookings)

    @property
    def spots_left(self) -> int:
        return max(self.capacity - len(self.bookings), 0)
