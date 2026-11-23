from pydantic import ConfigDict, Field, model_validator
from sqlmodel import SQLModel


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = None


class CategoriaUpdate(SQLModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None

    @model_validator(mode="after")
    def validar_nombre(self):
        if "nombre" in self.model_fields_set and self.nombre is None:
            raise ValueError("El nombre no puede ser nulo")
        return self


class CategoriaPublic(SQLModel):
    id: int
    nombre: str
    descripcion: str | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)
