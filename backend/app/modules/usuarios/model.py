from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: int | None = Field(default=None, primary_key=True)

    username: str = Field(
        min_length=3,
        max_length=50,
        unique=True,
        index=True,
    )

    full_name: str = Field(max_length=150)

    email: str = Field(
        max_length=255,
        unique=True,
        index=True,
    )

    hashed_password: str

    role: str = Field(default="user", max_length=20)

    disabled: bool = Field(default=False)

    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
