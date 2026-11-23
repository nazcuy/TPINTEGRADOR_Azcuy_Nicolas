# Food Store - Backend

API REST del Trabajo Práctico Integrador Food Store.

Desarrollada con **FastAPI, SQLModel y PostgreSQL**.

## Requisitos

- Python 3.11 a 3.13.
- PostgreSQL 15 o superior.

## Instalación

Crear y activar el entorno virtual:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1


Instalar las dependencias:
pip install -r requirements.txt


Configuración
Crear el archivo .env tomando como referencia .env.example.

Configurar las variables de conexión a PostgreSQL y seguridad.
Ejecutar
Iniciar el servidor:
uvicorn app.main:app --reload


Documentación de la API:
- http://localhost:8000/docs
- http://localhost:8000/redoc
Administrador inicial
- Usuario: admin
- Contraseña: Admin1234!
Módulos
- Usuarios y autenticación.
- Categorías.
- Productos.
- Pedidos.