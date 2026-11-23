from passlib.context import CryptContext

from app.core.exceptions import ConflictError
from app.modules.usuarios.model import Usuario
from app.modules.usuarios.schema import UserCreate
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def encriptar_password(password: str) -> str:
    return pwd_context.hash(password)


def verificar_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def registrar_usuario(data: UserCreate) -> Usuario:
    username = data.username.strip()
    email = str(data.email).lower().strip()

    with UsuarioUnitOfWork() as uow:
        if uow.usuarios.get_by_username(username):
            raise ConflictError("Ese nombre de usuario ya está registrado")

        if uow.usuarios.get_by_email(email):
            raise ConflictError("Ya existe una cuenta con ese email")

        usuario = Usuario(
            username=username,
            full_name=data.full_name.strip(),
            email=email,
            hashed_password=encriptar_password(data.password),
            role="user",
            disabled=False,
        )

        uow.usuarios.add(usuario)

        return usuario


def autenticar_usuario(
    identificador: str,
    password: str,
) -> Usuario | None:
    identificador = identificador.strip()

    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_email(
            identificador.lower()
        ) or uow.usuarios.get_by_username(identificador)

        if not usuario:
            return None

        if usuario.disabled:
            raise ConflictError("La cuenta de usuario está desactivada")

        if not verificar_password(password, usuario.hashed_password):
            return None

        return usuario


def obtener_perfil(usuario: Usuario) -> Usuario:
    return usuario


def listar_usuarios_admin() -> list[Usuario]:
    with UsuarioUnitOfWork() as uow:
        return uow.usuarios.get_all()


def desactivar_usuario(
    usuario_id: int,
    admin_id: int,
) -> Usuario | None:
    if usuario_id == admin_id:
        raise ConflictError("No podés desactivar tu propia cuenta")

    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_id(usuario_id)

        if not usuario:
            return None

        usuario.disabled = True
        return usuario


def activar_usuario(usuario_id: int) -> Usuario | None:
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_id(usuario_id)

        if not usuario:
            return None

        usuario.disabled = False
        return usuario
