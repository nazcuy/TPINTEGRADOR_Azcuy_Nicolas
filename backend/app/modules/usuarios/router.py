from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response,
    status,
)
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import settings
from app.core.exceptions import ConflictError
from app.core.security import (
    crear_access_token,
    get_current_active_user,
    require_role,
)
from app.modules.usuarios import service
from app.modules.usuarios.model import Usuario
from app.modules.usuarios.schema import (
    UserCreate,
    UserPublic,
)

# Rutas de autenticación
router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticación"],
)


# Rutas administrativas de usuarios
usuarios_admin_router = APIRouter(
    prefix="/api/v1/admin/usuarios",
    tags=["Usuarios"],
)


# REGISTRO
@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
)
def registrar(data: UserCreate):
    try:
        return service.registrar_usuario(data)
    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


# LOGIN
@router.post("/token")
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    try:
        usuario = service.autenticar_usuario(
            form_data.username,
            form_data.password,
        )
    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = crear_access_token({"sub": str(usuario.id)})

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    return {"message": "Login exitoso"}


# LOGOUT
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
    )

    return {"mensaje": "Sesión cerrada correctamente"}


# PERFIL DEL USUARIO AUTENTICADO
@router.get("/me", response_model=UserPublic)
def obtener_perfil(
    usuario: Usuario = Depends(get_current_active_user),
):
    return service.obtener_perfil(usuario)


# LISTAR USUARIOS (ADMIN)
@usuarios_admin_router.get(
    "",
    response_model=list[UserPublic],
)
def listar_usuarios(
    usuario: Usuario = Depends(require_role(["admin"])),
):
    return service.listar_usuarios_admin()


# ACTIVAR USUARIO (ADMIN)
@usuarios_admin_router.post(
    "/{usuario_id}/activar",
    response_model=UserPublic,
)
def activar_usuario(
    usuario_id: int,
    usuario: Usuario = Depends(require_role(["admin"])),
):
    resultado = service.activar_usuario(usuario_id)

    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    return resultado


# DESACTIVAR USUARIO (ADMIN)
@usuarios_admin_router.post(
    "/{usuario_id}/desactivar",
    response_model=UserPublic,
)
def desactivar_usuario(
    usuario_id: int,
    usuario: Usuario = Depends(require_role(["admin"])),
):
    try:
        resultado = service.desactivar_usuario(
            usuario_id,
            usuario.id,
        )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )

        return resultado

    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
