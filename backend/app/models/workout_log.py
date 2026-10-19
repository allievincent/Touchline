from datetime import date, datetime
from sqlalchemy import String, Text, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# one entry in someone's training journal (a lift, practice, run, etc.)
class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    kind: Mapped[str] = mapped_column(String(30))  # Lift, Practice, Conditioning, Game, Recovery
    title: Mapped[str] = mapped_column(String(120))
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60)
    effort: Mapped[int] = mapped_column(Integer, default=5)  # 1-10, how hard it felt
    notes: Mapped[str] = mapped_column(Text, default="")

    # optional: share it with a coach so they can leave feedback. null = private
    coach_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    coach_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    user: Mapped["User"] = relationship(foreign_keys=[user_id], back_populates="logs")
    coach: Mapped["User | None"] = relationship(foreign_keys=[coach_id])
    exercises: Mapped[list["Exercise"]] = relationship(
        back_populates="log", cascade="all, delete-orphan", order_by="Exercise.position"
    )


# a row inside a log, e.g. Squat 4 x 6 @ 135
class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(primary_key=True)
    log_id: Mapped[int] = mapped_column(ForeignKey("workout_logs.id"))
    position: Mapped[int] = mapped_column(Integer, default=0)
    name: Mapped[str] = mapped_column(String(80))
    sets: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reps: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)  # lbs

    log: Mapped["WorkoutLog"] = relationship(back_populates="exercises")
