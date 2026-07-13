-- =========================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Proyecto: Clon de Instagram - TP Backend
-- Motor: PostgreSQL
-- =========================================================
-- Instrucciones:
-- 1. Crear la base de datos (si no existe) desde DBeaver/pgAdmin:
--      CREATE DATABASE instagram_clon;
-- 2. Conectarse a esa base y ejecutar todo este script.
-- =========================================================

-- Eliminamos las tablas si ya existen, para poder ejecutar
-- el script varias veces sin errores (orden inverso por las FK)
DROP TABLE IF EXISTS publicaciones;
DROP TABLE IF EXISTS usuarios;

-- =========================================================
-- TABLA: usuarios
-- Almacena las cuentas registradas en la aplicación.
-- =========================================================
CREATE TABLE usuarios (
    id               SERIAL PRIMARY KEY,                  -- ID autoincremental
    nombre_usuario   VARCHAR(50)  NOT NULL UNIQUE,         -- Nickname único (ej: 'gato_programador')
    nombre_completo  VARCHAR(100) NOT NULL,                -- Nombre y apellido
    email            VARCHAR(100) NOT NULL UNIQUE,         -- Email único, usado para login
    password         VARCHAR(255) NOT NULL,                -- Password encriptado (hash bcrypt)
    foto_perfil      VARCHAR(255) DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
    biografia        TEXT,                                 -- Biografía opcional del usuario
    fecha_creacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP    -- Fecha de alta de la cuenta
);

-- =========================================================
-- TABLA: publicaciones
-- Relación One-to-Many: un usuario tiene muchas publicaciones.
-- =========================================================
CREATE TABLE publicaciones (
    id              SERIAL PRIMARY KEY,
    usuario_id      INT NOT NULL,                          -- FK hacia usuarios.id
    url_imagen      VARCHAR(255) NOT NULL,                 -- URL de la foto del gato
    descripcion     TEXT,                                  -- Descripción del post
    likes           INT DEFAULT 0,                         -- Contador de likes
    fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Clave foránea: si se borra el usuario, se borran sus publicaciones
    CONSTRAINT fk_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id)
        ON DELETE CASCADE
);

-- =========================================================
-- ÍNDICES (opcionales, mejoran performance en búsquedas)
-- =========================================================
CREATE INDEX idx_publicaciones_usuario_id ON publicaciones (usuario_id);
CREATE INDEX idx_usuarios_email ON usuarios (email);

-- =========================================================
-- DATOS DE PRUEBA (opcional, para testear rápido el login y el feed)
-- La contraseña en texto plano es "123456" en ambos casos,
-- pero acá se guarda ya "hasheada" con bcrypt (10 salt rounds)
-- para que puedas probar el login directamente.
-- =========================================================
INSERT INTO usuarios (nombre_usuario, nombre_completo, email, password, biografia)
VALUES
('gato_programador', 'Juan Perez', 'juan@test.com',
 '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVHgeKe8sYb6vTXCzs.FnaWaX7d7hK', -- hash de "123456"
 'Amante de los gatos y el código.'),
('michi_dev', 'Maria Lopez', 'maria@test.com',
 '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVHgeKe8sYb6vTXCzs.FnaWaX7d7hK', -- hash de "123456"
 'Frontend por el día, gatos por la noche.');

INSERT INTO publicaciones (usuario_id, url_imagen, descripcion, likes)
VALUES
(1, 'https://cataas.com/cat', 'Mi gato durmiendo la siesta', 5),
(2, 'https://cataas.com/cat', 'Mirada felina perfecta', 12);
