from datetime import datetime
from typing import Literal

from pydantic import ConfigDict, EmailStr, Field
from sqlmodel import SQLModel


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8)


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: EmailStr
    role: Literal["user", "admin"]
    disabled: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UsuarioAdminPublic(UserPublic):
    pass
