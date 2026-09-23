# SurtiWeb — Backend (Django + DRF)

API REST para el e-commerce SurtiTiendas, con arquitectura por capas (`domain` / `application` / `infrastructure` / `interfaces`) en cada app de negocio.

> **Este backend no se ejecuta dentro del sandbox de Figma Make** (no tiene Python ni PostgreSQL). Cópialo a una máquina o contenedor con Python 3.12+ para levantarlo. Como no se pudo correr `makemigrations` desde aquí, los paquetes `migrations/` de cada app están vacíos (solo `__init__.py`) — el primer `makemigrations` en tu máquina los generará.

## Apps

| App | Responsabilidad |
|---|---|
| `shared` | `BaseModel` con soft-delete (UUID, `created_at`, `updated_at`, `deleted_at`), paginación estándar, manejador de errores global |
| `apps.identity` | `User` (login por email) y `Role` (ADMIN / CLIENTE / VENDEDOR), JWT |
| `apps.catalog` | `Category`, `Product`, `ProductVariant`, `Price` (histórico), `ProductImage` |
| `apps.customers` | `Customer` y `CustomerAddress`, vinculados 1–1 a `User` |
| `apps.commerce` | `Cart`/`CartItem`, `Order`/`OrderLine`/`OrderStatusHistory`, checkout y cambios de estado |
| `apps.inventory` | `Warehouse`/`Stock` — capa opcional para inventario multi-bodega a futuro. El checkout de la Fase 2 valida y descuenta el stock directamente sobre `ProductVariant.stock` (single-warehouse), que es la fuente de verdad actual. |

## Tareas en background (Celery + Redis)

Redis es el broker y result backend de Celery (`config/celery.py`, configurado en `config/settings/base.py`). Las tareas viven en `infrastructure/tasks.py` de cada app y se re-exportan en un `tasks.py` en la raíz de la app (mismo patrón que `admin.py`) porque Celery solo autodescubre `tasks.py` al nivel de cada app listada en `INSTALLED_APPS`.

- `apps.commerce`: `send_order_confirmation_email` (al confirmar el checkout) y `send_order_status_update_email` (al cambiar de estado) — ambas se disparan con `transaction.on_commit(...)` dentro de los use cases, para no enviar el correo si la transacción termina revirtiéndose. En desarrollo `EMAIL_BACKEND` es la consola (no se necesita SMTP real); en producción usa SMTP vía variables de entorno.
- `apps.catalog`: `export_catalog_to_excel` — genera un `.xlsx` del catálogo en `media/exports/catalogo.xlsx`. Se dispara con `POST /api/v1/catalog/export/` (admin/vendedor) y se consulta con `GET /api/v1/catalog/export/<task_id>/`.

Para correrlas necesitas Redis (ya está en `docker-compose.yml`) y un worker de Celery aparte del `runserver`:

```bash
docker compose up -d          # ahora levanta Postgres Y Redis

# en una terminal:
python manage.py runserver

# en otra terminal, con el mismo venv activo:
celery -A config worker -l info --pool solo   # --pool solo es necesario en Windows
```

Si no quieres correr un worker mientras desarrollas, pon `CELERY_TASK_ALWAYS_EAGER=True` en tu `.env` — las tareas se ejecutan de forma síncrona, en el mismo proceso, sin necesitar Redis ni un worker.

## Reglas de negocio implementadas

- El precio de cada línea de pedido se toma del `Price` activo en el backend en el momento del checkout — nunca del cliente.
- El checkout valida stock suficiente por variante antes de crear el pedido (bloqueo con `select_for_update`); si falta stock, lanza `StockInsuficienteError` (HTTP 400 con mensaje en español).
- Un pedido vacío no puede confirmarse (`CarritoVacioError`).
- Los cambios de estado siguen una máquina de estados explícita (`OrderStatus.TRANSITIONS`): `PENDIENTE → CONFIRMADO → EMPACADO → ENVIADO → ENTREGADO`, con `CANCELADO` posible desde cualquier estado previo a `ENVIADO`. Una transición inválida lanza `TransicionEstadoInvalidaError`.
- Cancelar un pedido restaura el stock de cada línea.
- Ningún modelo se borra físicamente: `destroy()` en los ViewSets hace soft-delete (`deleted_at`), y el manager por defecto (`objects`) oculta los registros eliminados; `all_objects` los incluye.

## Configuración local

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
copy .env.example .env        # Windows: copy · macOS/Linux: cp

docker compose up -d          # levanta PostgreSQL (5432) y Redis (6379)

python manage.py makemigrations identity catalog customers commerce inventory
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_catalog # carga las mismas categorías/productos que el mock del frontend

python manage.py runserver
```

La API queda disponible en `http://localhost:8000/api/v1/` y el admin de Django en `http://localhost:8000/admin/`.

## Probar los flujos clave

```bash
# Registro de cliente
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@test.com","password":"clave12345","first_name":"Laura","last_name":"Galván"}'

# Login (devuelve access + refresh + datos del usuario)
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@test.com","password":"clave12345"}'

# Catálogo público
curl http://localhost:8000/api/v1/catalog/products/

# Agregar al carrito (requiere Authorization: Bearer <access>)
curl -X POST http://localhost:8000/api/v1/cart/ \
  -H "Authorization: Bearer <access>" -H "Content-Type: application/json" \
  -d '{"variant_id":"<uuid-de-una-variante>","quantity":2}'

# Checkout
curl -X POST http://localhost:8000/api/v1/checkout/ \
  -H "Authorization: Bearer <access>" -H "Content-Type: application/json" \
  -d '{"shipping_city":"Bogotá","shipping_address":"Calle 1 #2-3","payment_method":"CONTRAENTREGA","delivery_method":"DOMICILIO"}'
```

## Pruebas

```bash
pytest
```

Cubren: validación de stock insuficiente, que el precio del pedido se toma del backend (no del request), transiciones de estado válidas/inválidas, restauración de stock al cancelar, soft-delete, los flujos de registro/login/permisos por rol, y que el checkout/cambio de estado disparan el correo correspondiente (`CELERY_TASK_ALWAYS_EAGER=True` en `config/settings/test.py`, así que las tareas corren en el mismo proceso sin necesitar Redis).

## Frontend

El frontend en la raíz del repo (`src/`) ya está conectado a esta API real vía `src/services/*.service.ts` (JWT en `localStorage`, refresh automático en 401). Para probarlo junto con el backend:

1. Levanta el backend siguiendo los pasos de arriba (`runserver` en `:8000`).
2. En la raíz del repo, crea un `.env` a partir de `.env.example` con `VITE_API_URL=http://localhost:8000/api/v1`.
3. Corre el frontend (`pnpm dev`) y usa la tienda normalmente — el carrito sigue siendo local (localStorage/estado de React) hasta el checkout, momento en el que se sincroniza con el carrito del backend y se llama a `/checkout/`. Por eso el checkout exige sesión iniciada.
4. Para el panel admin (`/admin`), inicia sesión con el correo/contraseña de tu superusuario — ya no es un usuario/clave fijo, es una cuenta real con rol ADMIN o VENDEDOR.

Si el backend no está corriendo, el frontend lo detecta y muestra un mensaje de error claro en vez de romperse (probado sin backend levantado).
