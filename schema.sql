-- Tabla de administradores (ya existente)
CREATE TABLE IF NOT EXISTS administradores (
  id SERIAL PRIMARY KEY,
  nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
  correo_electronico VARCHAR(100) UNIQUE NOT NULL,
  contrasena TEXT NOT NULL,
  nombre_completo VARCHAR(100),
  rol VARCHAR(20) NOT NULL DEFAULT 'admin',
  activo BOOLEAN NOT NULL DEFAULT true,
  ultimo_acceso TIMESTAMP,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP
);

-- Tabla para productos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_producto VARCHAR(100),
  proveedor VARCHAR(100),
  estado VARCHAR(50),
  imagen_url TEXT,
  handle VARCHAR(255),
  precio DECIMAL(10, 2),
  precio_comparacion DECIMAL(10, 2),
  inventario INTEGER,
  sku VARCHAR(100),
  fecha_creacion TIMESTAMP,
  fecha_actualizacion TIMESTAMP,
  metadatos JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para colecciones
CREATE TABLE IF NOT EXISTS colecciones (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  handle VARCHAR(255),
  imagen_url TEXT,
  productos_count INTEGER DEFAULT 0,
  metadatos JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para relación productos-colecciones
CREATE TABLE IF NOT EXISTS productos_colecciones (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
  coleccion_id INTEGER REFERENCES colecciones(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(producto_id, coleccion_id)
);

-- Tabla para clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  email VARCHAR(255),
  telefono VARCHAR(50),
  acepta_marketing BOOLEAN DEFAULT FALSE,
  notas TEXT,
  tags TEXT[],
  direccion_predeterminada JSONB,
  metadatos JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(100),
  email VARCHAR(255),
  telefono VARCHAR(50),
  fecha_procesado TIMESTAMP,
  estado_financiero VARCHAR(50),
  estado_cumplimiento VARCHAR(50),
  precio_total DECIMAL(10, 2),
  moneda VARCHAR(10) DEFAULT 'USD',
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  direccion_envio JSONB,
  items JSONB,
  transacciones JSONB,
  tags TEXT[],
  metadatos JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para registro de sincronización
CREATE TABLE IF NOT EXISTS registro_sincronizacion (
  id SERIAL PRIMARY KEY,
  tipo_entidad VARCHAR(50) NOT NULL,
  entidad_id VARCHAR(255),
  accion VARCHAR(50) NOT NULL,
  resultado VARCHAR(50) NOT NULL,
  mensaje TEXT,
  detalles JSONB,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_shopify_id ON productos(shopify_id);
CREATE INDEX IF NOT EXISTS idx_colecciones_shopify_id ON colecciones(shopify_id);
CREATE INDEX IF NOT EXISTS idx_clientes_shopify_id ON clientes(shopify_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_shopify_id ON pedidos(shopify_id);
CREATE INDEX IF NOT EXISTS idx_registro_tipo_entidad ON registro_sincronizacion(tipo_entidad);
CREATE INDEX IF NOT EXISTS idx_registro_fecha ON registro_sincronizacion(fecha);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE
ON productos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_colecciones_updated_at BEFORE UPDATE
ON colecciones FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE
ON clientes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE
ON pedidos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
