from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.training_session import SessionOut
from app.schemas.user import UserPublic


class BookingCreate(BaseModel):
    session_id: int
    note: str | None = Field(default=None, max_length=255)


class BookingOut(BaseModel):
    id: int
    note: str | None
    created_at: datetime
    session: SessionOut

    model_config = ConfigDict(from_attributes=True)


class RosterEntry(BaseModel):
    """what a coach sees for each player signed up to their session"""
    id: int
    note: str | None
    created_at: datetime
    user: UserPublic

    model_config = ConfigDict(from_attributes=True)
