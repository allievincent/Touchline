import datetime as dt
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.user import UserPublic

Kind = Literal["Lift", "Practice", "Conditioning", "Game", "Recovery"]


class ExerciseIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    sets: int | None = Field(default=None, ge=1, le=50)
    reps: int | None = Field(default=None, ge=1, le=500)
    weight: float | None = Field(default=None, ge=0, le=2000)


class ExerciseOut(ExerciseIn):
    id: int
    model_config = ConfigDict(from_attributes=True)


class LogBase(BaseModel):
    date: dt.date
    kind: Kind
    title: str = Field(min_length=1, max_length=120)
    duration_minutes: int = Field(default=60, ge=1, le=600)
    effort: int = Field(default=5, ge=1, le=10)
    notes: str = ""
    coach_id: int | None = None  # who to share it with (optional)


class LogCreate(LogBase):
    exercises: list[ExerciseIn] = []


class LogUpdate(BaseModel):
    date: dt.date | None = None
    kind: Kind | None = None
    title: str | None = Field(default=None, min_length=1, max_length=120)
    duration_minutes: int | None = Field(default=None, ge=1, le=600)
    effort: int | None = Field(default=None, ge=1, le=10)
    notes: str | None = None
    coach_id: int | None = None
    exercises: list[ExerciseIn] | None = None  # if sent, replaces the whole list


class FeedbackIn(BaseModel):
    feedback: str = Field(max_length=2000)


class LogOut(LogBase):
    id: int
    user: UserPublic
    coach: UserPublic | None
    coach_feedback: str | None
    exercises: list[ExerciseOut]
    created_at: dt.datetime

    model_config = ConfigDict(from_attributes=True)
