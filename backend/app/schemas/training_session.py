from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.user import UserPublic

Focus = Literal["Goalkeeping", "Finishing", "Passing", "Defending", "Fitness", "Small-Sided Games"]
Level = Literal["Beginner", "Intermediate", "Advanced"]


class SessionBase(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    focus: Focus
    level: Level
    description: str = ""
    location: str = Field(min_length=1, max_length=120)
    start_time: datetime
    duration_minutes: int = Field(default=60, ge=15, le=240)
    capacity: int = Field(default=12, ge=1, le=100)


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    focus: Focus | None = None
    level: Level | None = None
    description: str | None = None
    location: str | None = Field(default=None, min_length=1, max_length=120)
    start_time: datetime | None = None
    duration_minutes: int | None = Field(default=None, ge=15, le=240)
    capacity: int | None = Field(default=None, ge=1, le=100)


class SessionOut(SessionBase):
    id: int
    coach: UserPublic
    booked_count: int
    spots_left: int

    model_config = ConfigDict(from_attributes=True)
