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
    ("Hamburguesas", "Hamburguesa clásica", "Carne, lechuga y tomate.", "4500.00", 20, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80"),
    (
        "Hamburguesas",
        "Hamburguesa doble cheddar",
        "Doble carne y queso cheddar.",
        "6200.00",
        15, "https://images.unsplash.com/photo-1599155253646-7989e08c05c1?auto=format&fit=crop&w=700&q=80"
    ),
    ("Hamburguesas", "Hamburguesa veggie", "Hamburguesa de vegetales.", "5400.00", 12, "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=700&q=80"),
    ("Acompañamientos", "Papas fritas", "Porción de papas fritas.", "2800.00", 30, "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80"),
    (
        "Acompañamientos",
        "Nuggets de pollo",
        "Porción de nuggets de pollo.",
        "3500.00",
        20, "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=700&q=80"
    ),
    ("Bebidas", "Agua mineral 500 ml", "Agua mineral sin gas.", "1800.00", 30, "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=700&q=80"),
    ("Bebidas", "Gaseosa cola 1.5 L", "Gaseosa sabor cola.", "2500.00", 25, "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=700&q=80"),
    ("Bebidas", "Jugo de naranja 1 L", "Jugo de naranja.", "2800.00", 18, "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=700&q=80"),
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
        for (nombre_categoria,
            nombre,
            descripcion,
            precio,
            stock,
            imagen_url,
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
                    imagen_url=imagen_url,
                    stock=stock,
                    disponible=True,
                    activo=True,
                )
                session.add(producto)
            elif producto.imagen_url is None:
                producto.imagen_url = imagen_url
                session.add(producto)

        session.commit()

    print("Datos iniciales verificados correctamente.")
