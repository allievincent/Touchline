from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="player")  # "player" or "coach"
    position: Mapped[str | None] = mapped_column(String(50), nullable=True)  # e.g. Goalkeeper
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    # a coach has sessions they run, a player has bookings
    sessions: Mapped[list["TrainingSession"]] = relationship(back_populates="coach", cascade="all, delete-orphan")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    logs: Mapped[list["WorkoutLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", foreign_keys="WorkoutLog.user_id"
    )
