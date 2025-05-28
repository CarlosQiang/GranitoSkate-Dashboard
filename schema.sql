-- Tabla de administradores (ya existente)
CREATE TABLE IF NOT EXISTS administradores (
  id SERIAL PRIMARY KEY,
  nombre_usuario VARCHAR(255) UNIQUE NOT NULL,
  correo_electronico VARCHAR(255) UNIQUE NOT NULL,
  contrasena TEXT NOT NULL,
  nombre_completo VARCHAR(255),
  rol VARCHAR(20) NOT NULL DEFAULT 'admin',
  activo BOOLEAN NOT NULL DEFAULT true,
  ultimo_acceso TIMESTAMP,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP
);

-- Insert admin user
INSERT INTO administradores ("nombre_usuario", "correo_electronico", "contrasena", "nombre_completo", "rol", "activo", "ultimo_acceso") VALUES ('admin', 'admin@gmail.com', '$2a$10$1X.GQIJJk8L9Fz3HZhQQo.6EsHgHKm7Brx0bKQA9fI.SSjN.ym3Uy', 'Administrador Principal', 'superadmin', true, '2025-05-28 11:13:37.846+00');

-- Tabla de registro_sincronizacion (ya existente)
CREATE TABLE IF NOT EXISTS registro_sincronizacion (
  id SERIAL PRIMARY KEY,
  tipo_entidad VARCHAR(50),
  entidad_id VARCHAR(255),
  accion VARCHAR(50),
  resultado VARCHAR(50),
  mensaje TEXT,
  detalles JSON,
  fecha TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla simplificada para productos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2),
  inventario INTEGER DEFAULT 0,
  imagen_url TEXT,
  datos_adicionales JSON,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP
);

-- Tabla simplificada para colecciones
CREATE TABLE IF NOT EXISTS colecciones (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  datos_adicionales JSON,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP
);

-- Tabla simplificada para clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255),
  email VARCHAR(255),
  nombre VARCHAR(255),
  telefono VARCHAR(50),
  datos_adicionales JSON,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP
);

-- Tabla simplificada para pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255),
  cliente_id VARCHAR(255),
  total DECIMAL(10, 2),
  estado VARCHAR(50),
  datos_adicionales JSON,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP
);

-- Tabla simplificada para promociones
CREATE TABLE IF NOT EXISTS promociones (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  tipo VARCHAR(50),
  valor DECIMAL(10, 2),
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  activa BOOLEAN DEFAULT true,
  datos_adicionales JSON,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP
);
