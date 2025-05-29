-- Eliminar tablas innecesarias
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS archivos_multimedia CASCADE;
DROP TABLE IF EXISTS configuraciones_aplicacion CASCADE;
DROP TABLE IF EXISTS configuraciones_usuario CASCADE;

-- Asegurar que las tablas principales existen con la estructura correcta
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    shopify_id VARCHAR(255) UNIQUE NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50) DEFAULT 'active',
    precio_base DECIMAL(10,2) DEFAULT 0,
    inventario_disponible INTEGER DEFAULT 0,
    tipo_producto VARCHAR(255) DEFAULT 'SKATEBOARD',
    proveedor VARCHAR(255) DEFAULT 'GranitoSkate',
    imagen_destacada_url TEXT,
    url_handle VARCHAR(255),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    shopify_id VARCHAR(255) UNIQUE NOT NULL,
    numero_pedido VARCHAR(255),
    total DECIMAL(10,2) DEFAULT 0,
    moneda VARCHAR(10) DEFAULT 'EUR',
    email_cliente VARCHAR(255),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    shopify_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(500),
    telefono VARCHAR(50),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS colecciones (
    id SERIAL PRIMARY KEY,
    shopify_id VARCHAR(255) UNIQUE NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    descripcion TEXT,
    url_handle VARCHAR(255),
    imagen_url TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS configuracion_shopify (
    id SERIAL PRIMARY KEY,
    dominio_tienda VARCHAR(255) UNIQUE NOT NULL,
    token_configurado BOOLEAN DEFAULT false,
    activa BOOLEAN DEFAULT false,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS metadatos_seo (
    id SERIAL PRIMARY KEY,
    tipo_entidad VARCHAR(100) UNIQUE NOT NULL,
    titulo VARCHAR(500),
    descripcion TEXT,
    palabras_clave TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promociones (
    id SERIAL PRIMARY KEY,
    shopify_id VARCHAR(255) UNIQUE,
    titulo VARCHAR(500) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(100),
    valor DECIMAL(10,2),
    codigo VARCHAR(255),
    activa BOOLEAN DEFAULT false,
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_shopify_id ON productos(shopify_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_shopify_id ON pedidos(shopify_id);
CREATE INDEX IF NOT EXISTS idx_clientes_shopify_id ON clientes(shopify_id);
CREATE INDEX IF NOT EXISTS idx_colecciones_shopify_id ON colecciones(shopify_id);
CREATE INDEX IF NOT EXISTS idx_productos_estado ON productos(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
