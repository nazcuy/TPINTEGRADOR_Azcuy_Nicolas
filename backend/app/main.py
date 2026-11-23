from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from app.core.database import engine, settings
from app.core.seed import seed_datos_iniciales
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.usuarios.router import usuarios_admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    seed_datos_iniciales()
    yield


app = FastAPI(
    title="Food Store API",
    description="API del Trabajo Práctico Integrador Food Store",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios_router)
app.include_router(usuarios_admin_router)
app.include_router(categorias_router)
app.include_router(productos_router)
app.include_router(pedidos_router)


@app.get("/")
def root():
    return {"mensaje": "Food Store API funcionando correctamente"}
