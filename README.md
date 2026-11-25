# Food Store - Trabajo Práctico Integrador

Sistema web de gestión y venta de productos gastronómicos desarrollado para la materia Programación IV.

El proyecto permite consultar un catálogo de productos, administrar categorías y productos, realizar compras, gestionar pedidos y administrar usuarios según sus roles.

## Enlaces de entrega

- Repositorio público de GitHub: https://github.com/nazcuy/TPINTEGRADOR_Azcuy_Nicolas.git

- Video de demostración (10 a 15 minutos): https://youtu.be/kQCBK88fvMQ

## Tecnologías utilizadas

### Backend
- Python 3.13
- FastAPI
- SQLModel
- SQLAlchemy
- PostgreSQL
- JWT mediante cookies HttpOnly
- Ruff para análisis estático y formato de código

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router 7
- TanStack Query
- TanStack Form
- TanStack Table
- Zustand
- Axios
- pnpm

## Funcionalidades

### Usuarios y autenticación
- Registro de usuarios.
- Inicio y cierre de sesión.
- Autenticación mediante JWT almacenado en cookie HttpOnly.
- Recuperación de sesión.
- Administración de usuarios.
- Activación y desactivación de cuentas.
- Control de acceso según los roles `user` y `admin`.

### Catálogo y productos
- Consulta pública del catálogo.
- Búsqueda de productos.
- Filtrado por categoría y disponibilidad.
- Paginación.
- Administración de productos.
- Actualización de stock.
- Administración de categorías.
- Baja lógica de productos y categorías.

### Compras y pedidos
- Carrito de compras persistente.
- Validación de disponibilidad y stock.
- Checkout con dirección de entrega y forma de pago.
- Consulta de pedidos propios.
- Consulta de todos los pedidos por parte del administrador.
- Visualización del detalle de cada pedido.
- Cancelación de pedidos pendientes.
- Restitución de stock al cancelar pedidos.
- Administración de los estados de los pedidos.

Los estados de los pedidos siguen estas transiciones:

- `PENDIENTE` → `EN_PREPARACION` o `CANCELADO`.
- `EN_PREPARACION` → `ENTREGADO` o `CANCELADO`.
- `ENTREGADO` y `CANCELADO` son estados finales.

### Administración
- Resumen general de pedidos.
- Indicadores de pedidos pendientes, en preparación, entregados y cancelados.
- Cantidad de pedidos del día.
- Ingresos correspondientes a pedidos entregados.
- Gestión de productos, categorías y usuarios.

## Arquitectura

### Backend

El backend está organizado en capas:

`Router → Service → Unit of Work → Repository → Model`

Esta separación permite organizar las responsabilidades de cada módulo y gestionar las operaciones transaccionales mediante Unit of Work.

### Frontend

El frontend está organizado por funcionalidades (*features*):

- `features/auth`: autenticación, registro y administración de usuarios.
- `features/categories`: gestión de categorías.
- `features/products`: catálogo y gestión de productos.
- `features/orders`: carrito, checkout y gestión de pedidos.
- `shared/api`: configuración de Axios e interceptores.
- `shared/components`: componentes compartidos.
- `routes`: configuración y protección de rutas.
- `store`: estado global del carrito, tema y notificaciones.

## Requisitos previos

Para ejecutar el proyecto se necesita:

- Python 3.13.
- PostgreSQL 15 o superior.
- Node.js compatible con Vite 8.
- pnpm 9 o superior.

## Configuración de la base de datos

Crear una base de datos PostgreSQL llamada:

`foodstore_tpi`

Configurar un usuario con permisos para conectarse y operar sobre ella.

La URL de conexión se define mediante la variable `DATABASE_URL` en el archivo `backend/.env`.

Ejemplo:

`postgresql+psycopg2://admin:CAMBIAR_PASSWORD@localhost:5433/foodstore_tpi`

Adaptar el usuario, la contraseña y el puerto según la instalación local de PostgreSQL.

Al iniciar el backend se crean las tablas y se verifican los datos iniciales.

## Instalación y ejecución del backend

Desde una terminal de PowerShell, ingresar a la carpeta `backend`:

```powershell
cd backend
```

Crear el entorno virtual:

```powershell
python -m venv .venv
```

Activarlo:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instalar las dependencias:

```powershell
python -m pip install -r requirements.txt
```

Crear el archivo de configuración:

```powershell
Copy-Item .env.example .env
```

Editar `backend/.env` y configurar las siguientes variables:

- `DATABASE_URL`: URL de conexión a PostgreSQL.
- `SECRET_KEY`: clave secreta utilizada para firmar los JWT.
- `ALGORITHM`: algoritmo de firma.
- `ACCESS_TOKEN_EXPIRE_MINUTES`: duración del token.
- `FRONTEND_ORIGIN`: origen permitido para el frontend.

Para generar una clave secreta:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Iniciar el servidor:

```powershell
uvicorn app.main:app --reload
```

El backend estará disponible en:

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Instalación y ejecución del frontend

Abrir una segunda terminal de PowerShell.

Ingresar a la carpeta `frontend`:

```powershell
cd frontend
```

Instalar las dependencias:

```powershell
pnpm install
```

Crear el archivo de configuración:

```powershell
Copy-Item .env.example .env
```

Verificar que la variable `VITE_API_URL` apunte al backend:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Iniciar el servidor de desarrollo:

```powershell
pnpm dev
```

El frontend estará disponible normalmente en:

http://localhost:5173

**Importante:** el backend y el frontend deben permanecer ejecutándose en terminales independientes.

## Usuario administrador inicial

El sistema crea un administrador inicial mediante el proceso de seed:

- Usuario: `admin`
- Contraseña inicial: `Admin1234!`

Estas credenciales están destinadas al entorno local y a la evaluación del trabajo práctico.

Se recomienda modificarlas antes de utilizar el sistema en un entorno real.

## Verificaciones de calidad

### Backend

Instalar Ruff:

```powershell
python -m pip install ruff==0.17.6
```

Ejecutar el análisis estático:

```powershell
python -m ruff check app
```

Verificar el formato:

```powershell
python -m ruff format --check app
```

Verificar la compilación:

```powershell
python -m compileall -q app
```

Verificar las dependencias:

```powershell
python -m pip check
```

### Frontend

Ejecutar ESLint:

```powershell
pnpm lint
```

Compilar para producción:

```powershell
pnpm build
```

## Rutas principales del frontend

### Públicas
- `/`: catálogo de productos.
- `/login`: inicio de sesión.
- `/register`: registro.
- `/carrito`: carrito de compras.

### Usuario autenticado
- `/checkout`: confirmación de compra.
- `/mis-pedidos`: historial de pedidos.

### Administrador
- `/admin/resumen`: resumen administrativo.
- `/admin/productos`: gestión de productos.
- `/admin/categorias`: gestión de categorías.
- `/admin/pedidos`: gestión de pedidos.
- `/admin/usuarios`: gestión de usuarios.

## Seguridad

- Las contraseñas se almacenan mediante hashing.
- La autenticación utiliza JWT en cookies HttpOnly.
- El frontend no almacena el token en localStorage.
- Las rutas protegidas verifican la autenticación y el rol del usuario.
- El backend valida los permisos y las reglas de negocio.
- Los archivos `.env` contienen información privada y no deben compartirse ni subirse al repositorio.

## Estructura general del proyecto

```text
TPINTEGRADOR_Azcuy_Nicolas/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   └── modules/
│   │       ├── categorias/
│   │       ├── pedidos/
│   │       ├── productos/
│   │       └── usuarios/
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── categories/
│   │   │   ├── orders/
│   │   │   └── products/
│   │   ├── routes/
│   │   ├── shared/
│   │   └── store/
│   ├── package.json
│   └── README.md
├── TPI_Food_Store.pdf
├── UML_Food_Store.svg
└── README.md
```

## Información del trabajo práctico

**Proyecto:** Food Store  
**Materia:** Programación IV  
**Tipo de aplicación:** Sistema web de gestión y venta de productos gastronómicos.

