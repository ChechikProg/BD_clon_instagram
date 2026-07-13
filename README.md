# API REST - Clon de Instagram (Backend)

API REST desarrollada con **Node.js + Express + PostgreSQL** que reemplaza los mocks del frontend React por un backend real, con registro/login, sesiones vía **JWT**, middlewares de validación y protección de endpoints sensibles.

---

## 1. Arquitectura por capas

El proyecto sigue una arquitectura en capas con responsabilidades separadas:

```
/src
  ├── /config        --> Conexión a la Base de Datos (pool de pg) usando variables de entorno.
  ├── /controllers    --> Lógica de negocio. Reciben req/res, llaman a los services y arman la respuesta HTTP.
  ├── /middlewares    --> Intercepción de peticiones: verificación de JWT y validación de datos de entrada.
  ├── /routes         --> Definición de endpoints, asociándolos a middlewares + controllers.
  ├── /services       --> Capa de datos pura: solo ejecuta queries SQL contra PostgreSQL. No conoce req/res.
  └── app.js          --> Inicialización de Express, CORS y montado de rutas.
server.js             --> Punto de entrada: levanta el servidor HTTP.
sql/create_tables.sql --> Script de creación de las tablas.
```

**Flujo de una petición típica** (ejemplo: crear una publicación protegida):

```
Cliente -> routes/postRoutes.js
        -> middlewares/authMiddleware.js   (valida el JWT, agrega req.user)
        -> middlewares/validationMiddleware.js (valida el body)
        -> controllers/postController.js  (arma la lógica, llama al service)
        -> services/postService.js        (ejecuta el INSERT en PostgreSQL)
        -> controller devuelve la respuesta JSON al cliente
```

Esta separación permite:
- Cambiar el motor de base de datos sin tocar controllers ni rutas (solo services).
- Testear la lógica de negocio sin necesitar una base de datos real (mockeando services).
- Reutilizar middlewares (ej: `authMiddleware`) en cualquier ruta protegida.

---

## 2. Modelo de datos (PostgreSQL)

El script completo está en [`sql/create_tables.sql`](./sql/create_tables.sql). Resumen:

### Tabla `usuarios`

| Campo            | Tipo         | Restricciones                  |
|------------------|--------------|---------------------------------|
| id               | SERIAL       | PK, autoincremental             |
| nombre_usuario   | VARCHAR(50)  | UNIQUE, NOT NULL                |
| nombre_completo  | VARCHAR(100) | NOT NULL                        |
| email            | VARCHAR(100) | UNIQUE, NOT NULL                |
| password         | VARCHAR(255) | NOT NULL (hash bcrypt)          |
| foto_perfil      | VARCHAR(255) | DEFAULT (avatar genérico)       |
| biografia        | TEXT         | opcional                        |
| fecha_creacion   | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP       |

### Tabla `publicaciones`

| Campo          | Tipo         | Restricciones                                  |
|----------------|--------------|--------------------------------------------------|
| id             | SERIAL       | PK, autoincremental                              |
| usuario_id     | INT          | FK -> usuarios(id), ON DELETE CASCADE            |
| url_imagen     | VARCHAR(255) | NOT NULL                                         |
| descripcion    | TEXT         | opcional                                         |
| likes          | INT          | DEFAULT 0                                        |
| fecha_creacion | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP                        |

**Relación:** un usuario tiene muchas publicaciones (`One-to-Many`). Si se borra un usuario, sus publicaciones se borran en cascada (`ON DELETE CASCADE`).

---

## 3. Endpoints de la API

Base URL local: `http://localhost:3000/api`

### 🔓 Rutas públicas

#### `POST /auth/register`
Registra un nuevo usuario.

**Body esperado:**
```json
{
  "nombre_usuario": "gato_programador",
  "nombre_completo": "Juan Perez",
  "email": "juan@test.com",
  "password": "123456"
}
```

**Respuesta 201:**
```json
{
  "mensaje": "Usuario registrado correctamente.",
  "usuario": { "id": 1, "nombre_usuario": "gato_programador", "...": "..." }
}
```

#### `POST /auth/login`
Valida credenciales y devuelve el JWT.

**Body esperado:**
```json
{ "email": "juan@test.com", "password": "123456" }
```

**Respuesta 200:**
```json
{
  "mensaje": "Login exitoso.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": { "id": 1, "nombre_usuario": "gato_programador", "email": "juan@test.com" }
}
```

#### `GET /publicaciones`
Devuelve el feed global (todas las publicaciones + datos del autor).

**Respuesta 200:**
```json
[
  {
    "id": 1,
    "url_imagen": "https://cataas.com/cat",
    "descripcion": "Mi gato durmiendo la siesta",
    "likes": 5,
    "fecha_creacion": "2026-01-01T00:00:00.000Z",
    "usuario_id": 1,
    "nombre_usuario": "gato_programador",
    "foto_perfil": "https://..."
  }
]
```

### 🔒 Rutas protegidas (requieren header `Authorization: Bearer <token>`)

#### `GET /usuarios/perfil`
Devuelve el perfil del usuario autenticado junto a sus publicaciones.

**Respuesta 200:**
```json
{
  "id": 1,
  "nombre_usuario": "gato_programador",
  "nombre_completo": "Juan Perez",
  "email": "juan@test.com",
  "foto_perfil": "https://...",
  "biografia": "Amante de los gatos y el código.",
  "cantidad_publicaciones": 1,
  "publicaciones": [ /* ... */ ]
}
```

#### `PUT /usuarios/perfil`
Edita datos del usuario autenticado.

**Body esperado (todos los campos opcionales):**
```json
{
  "nombre_completo": "Juan A. Perez",
  "biografia": "Nueva bio",
  "foto_perfil": "https://nueva-foto.com/img.png"
}
```

#### `POST /publicaciones`
Crea una publicación asociada al usuario autenticado (el `usuario_id` sale del token, no del body).

**Body esperado:**
```json
{
  "url_imagen": "https://cataas.com/cat",
  "descripcion": "Nuevo gatito"
}
```

**Respuesta 201:**
```json
{
  "mensaje": "Publicación creada correctamente.",
  "publicacion": { "id": 3, "usuario_id": 1, "url_imagen": "...", "likes": 0, "...": "..." }
}
```

---

## 4. JWT: configuración y payload

- Se firma con `jsonwebtoken` usando una clave secreta guardada en `.env` (`JWT_SECRET`).
- Expiración configurable vía `.env` (`JWT_EXPIRES_IN`, por defecto `2h`).
- **Payload guardado dentro del token** (solo datos no sensibles):
  ```json
  { "id": 1, "nombre_usuario": "gato_programador", "email": "juan@test.com" }
  ```
  La contraseña **nunca** se incluye en el payload.
- El middleware `authMiddleware.js`:
  1. Lee el header `Authorization`.
  2. Verifica que tenga el formato `Bearer <token>`.
  3. Verifica la firma con `jwt.verify()`.
  4. Si es válido, agrega los datos decodificados a `req.user` y llama a `next()`.
  5. Si falta o es inválido/expiró, corta la petición con `401 Unauthorized`.

---

## 5. Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo .env a partir del ejemplo
cp .env.example .env
# completar DB_HOST, DB_USER, DB_PASSWORD, DB_NAME y JWT_SECRET

# 3. Crear la base de datos en PostgreSQL (DBeaver/pgAdmin/psql)
#    y ejecutar el script sql/create_tables.sql

# 4. Levantar el servidor
npm run dev   # con nodemon (recarga automática)
# o
npm start     # sin nodemon
```

El servidor queda disponible en `http://localhost:3000`.

---

## 6. Checklist de entrega

- [x] Servidor Express corriendo sin errores.
- [x] Conexión a PostgreSQL vía pool (`config/db.js`).
- [x] Arquitectura separada en `/routes`, `/middlewares`, `/controllers`, `/services`.
- [x] Emisión de JWT tras login exitoso.
- [x] Middleware de autenticación protegiendo rutas privadas.
- [x] Endpoint de perfil dinámico según el token.
- [x] Manejo de variables de entorno con `.env` + `.env.example`.
