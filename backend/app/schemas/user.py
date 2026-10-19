from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    role: Literal["player", "coach"] = "player"
    position: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserUpdate(BaseModel):
    # everything optional so you can update just one field
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    position: str | None = None
    password: str | None = Field(default=None, min_length=6)


class UserOut(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserPublic(BaseModel):
    """smaller version that's safe to show other people (no email)"""
    id: int
    name: str
    role: str
    position: str | None = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
