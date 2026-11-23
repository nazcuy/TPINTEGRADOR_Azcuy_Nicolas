from decimal import Decimal

from passlib.context import CryptContext
from sqlmodel import Session, select

from app.core.database import engine
from app.modules.categorias.model import Categoria
from app.modules.productos.model import Producto
from app.modules.usuarios.model import Usuario

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


CATEGORIAS_INICIALES = [
    ("Hamburguesas", "Hamburguesas clásicas y especiales."),
    ("Acompañamientos", "Guarniciones y complementos."),
    ("Bebidas", "Bebidas frías."),
]


PRODUCTOS_INICIALES = [
    ("Hamburguesas", "Hamburguesa clásica", "Carne, lechuga y tomate.", "4500.00", 20),
    (
        "Hamburguesas",
        "Hamburguesa doble cheddar",
        "Doble carne y queso cheddar.",
        "6200.00",
        15,
    ),
    ("Hamburguesas", "Hamburguesa veggie", "Hamburguesa de vegetales.", "5400.00", 12),
    ("Acompañamientos", "Papas fritas", "Porción de papas fritas.", "2800.00", 30),
    (
        "Acompañamientos",
        "Nuggets de pollo",
        "Porción de nuggets de pollo.",
        "3500.00",
        20,
    ),
    ("Bebidas", "Agua mineral 500 ml", "Agua mineral sin gas.", "1800.00", 30),
    ("Bebidas", "Gaseosa cola 1.5 L", "Gaseosa sabor cola.", "2500.00", 25),
    ("Bebidas", "Jugo de naranja 1 L", "Jugo de naranja.", "2800.00", 18),
]


def seed_datos_iniciales():
    with Session(engine) as session:
        # Administrador inicial
        admin = session.exec(select(Usuario).where(Usuario.username == "admin")).first()

        if admin is None:
            admin = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=pwd_context.hash("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
        else:
            admin.role = "admin"
            admin.disabled = False

        # Categorías iniciales
        categorias = {}

        for nombre, descripcion in CATEGORIAS_INICIALES:
            categoria = session.exec(
                select(Categoria).where(Categoria.nombre == nombre)
            ).first()

            if categoria is None:
                categoria = Categoria(
                    nombre=nombre,
                    descripcion=descripcion,
                    activo=True,
                )
                session.add(categoria)
                session.flush()

            categorias[nombre] = categoria

        # Productos iniciales
        for (
            nombre_categoria,
            nombre,
            descripcion,
            precio,
            stock,
        ) in PRODUCTOS_INICIALES:
            producto = session.exec(
                select(Producto).where(Producto.nombre == nombre)
            ).first()

            if producto is None:
                producto = Producto(
                    categoria_id=categorias[nombre_categoria].id,
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=Decimal(precio),
                    imagen_url=None,
                    stock=stock,
                    disponible=True,
                    activo=True,
                )
                session.add(producto)

        session.commit()

    print("Datos iniciales verificados correctamente.")
