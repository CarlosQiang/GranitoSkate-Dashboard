-- GestionGranito-App - Esquema simplificado para Neon PostgreSQL
-- Ejecutar este script completo en la consola de Neon

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de usuarios simplificada
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hash_contrasena VARCHAR(255),
    nombre VARCHAR(255),
    url_avatar TEXT,
    rol VARCHAR(50) DEFAULT 'usuario',
    email_verificado BOOLEAN DEFAULT FALSE,
    esta_activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración Shopify simplificada
CREATE TABLE IF NOT EXISTS configuracion_shopify (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_usuario VARCHAR(255) NOT NULL,
    nombre_tienda VARCHAR(255) NOT NULL,
    url_tienda VARCHAR(255) NOT NULL,
    clave_api VARCHAR(255),
    secreto_api VARCHAR(255),
    token_acceso TEXT,
    esta_activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos simplificada
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_usuario VARCHAR(255) NOT NULL,
    shopify_id VARCHAR(255),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2),
    precio_comparacion DECIMAL(10,2),
    sku VARCHAR(255),
    codigo_barras VARCHAR(255),
    cantidad_inventario INTEGER DEFAULT 0,
    peso DECIMAL(8,2),
    unidad_peso VARCHAR(10) DEFAULT 'kg',
    estado VARCHAR(50) DEFAULT 'borrador',
    esta_publicado BOOLEAN DEFAULT FALSE,
    url_imagen_principal TEXT,
    imagenes_adicionales JSONB DEFAULT '[]',
    etiquetas TEXT[],
    categoria VARCHAR(255),
    proveedor VARCHAR(255),
    datos_shopify JSONB DEFAULT '{}',
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de colecciones simplificada
CREATE TABLE IF NOT EXISTS colecciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_usuario VARCHAR(255) NOT NULL,
    shopify_id VARCHAR(255),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    url_imagen TEXT,
    esta_publicado BOOLEAN DEFAULT TRUE,
    orden_clasificacion INTEGER DEFAULT 0,
    datos_shopify JSONB DEFAULT '{}',
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación productos-colecciones
CREATE TABLE IF NOT EXISTS productos_colecciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_producto UUID NOT NULL,
    id_coleccion UUID NOT NULL,
    posicion INTEGER DEFAULT 0,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes simplificada
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_usuario VARCHAR(255) NOT NULL,
    shopify_id VARCHAR(255),
    email VARCHAR(255),
    nombre VARCHAR(255),
    apellidos VARCHAR(255),
    telefono VARCHAR(50),
    acepta_marketing BOOLEAN DEFAULT FALSE,
    total_pedidos INTEGER DEFAULT 0,
    total_gastado DECIMAL(10,2) DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'activo',
    datos_shopify JSONB DEFAULT '{}',
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pedidos simplificada
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_usuario VARCHAR(255) NOT NULL,
    shopify_id VARCHAR(255),
    numero_pedido VARCHAR(255),
    id_cliente UUID,
    email_cliente VARCHAR(255),
    estado VARCHAR(50),
    estado_financiero VARCHAR(50),
    estado_cumplimiento VARCHAR(50),
    moneda VARCHAR(10) DEFAULT 'EUR',
    subtotal DECIMAL(10,2),
    impuestos DECIMAL(10,2),
    envio DECIMAL(10,2),
    descuentos DECIMAL(10,2),
    total DECIMAL(10,2),
    datos_shopify JSONB DEFAULT '{}',
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de promociones simplificada
CREATE TABLE IF NOT EXISTS promociones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_usuario VARCHAR(255) NOT NULL,
    shopify_id VARCHAR(255),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    codigo VARCHAR(100),
    fecha_inicio TIMESTAMPTZ,
    fecha_fin TIMESTAMPTZ,
    activa BOOLEAN DEFAULT TRUE,
    limite_uso INTEGER,
    contador_uso INTEGER DEFAULT 0,
    condiciones JSONB DEFAULT '{}',
    datos_shopify JSONB DEFAULT '{}',
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuraciones personalizadas
CREATE TABLE IF NOT EXISTS configuraciones_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_usuario VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    clave_configuracion VARCHAR(255) NOT NULL,
    valor_configuracion JSONB NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email_usuario, categoria, clave_configuracion)
);

-- Tabla de archivos multimedia
CREATE TABLE IF NOT EXISTS archivos_multimedia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_usuario VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    url_archivo TEXT NOT NULL,
    tipo_archivo VARCHAR(100),
    tamano_archivo INTEGER,
    ancho INTEGER,
    alto INTEGER,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de registros de actividad
CREATE TABLE IF NOT EXISTS registros_actividad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_usuario VARCHAR(255),
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    datos_adicionales JSONB DEFAULT '{}',
    direccion_ip VARCHAR(45),
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuraciones globales de la aplicación
CREATE TABLE IF NOT EXISTS configuraciones_aplicacion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(255) UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de metadatos SEO simplificada
CREATE TABLE IF NOT EXISTS metadatos_seo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_usuario VARCHAR(255) NOT NULL,
    tipo_entidad VARCHAR(50) NOT NULL,
    id_entidad VARCHAR(255) NOT NULL,
    titulo VARCHAR(255),
    descripcion TEXT,
    palabras_clave TEXT,
    datos_adicionales JSONB DEFAULT '{}',
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_productos_email_usuario ON productos(email_usuario);
CREATE INDEX IF NOT EXISTS idx_productos_shopify_id ON productos(shopify_id);
CREATE INDEX IF NOT EXISTS idx_productos_estado ON productos(estado);
CREATE INDEX IF NOT EXISTS idx_colecciones_email_usuario ON colecciones(email_usuario);
CREATE INDEX IF NOT EXISTS idx_colecciones_shopify_id ON colecciones(shopify_id);
CREATE INDEX IF NOT EXISTS idx_clientes_email_usuario ON clientes(email_usuario);
CREATE INDEX IF NOT EXISTS idx_clientes_shopify_id ON clientes(shopify_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_email_usuario ON pedidos(email_usuario);
CREATE INDEX IF NOT EXISTS idx_pedidos_shopify_id ON pedidos(shopify_id);
CREATE INDEX IF NOT EXISTS idx_promociones_email_usuario ON promociones(email_usuario);
CREATE INDEX IF NOT EXISTS idx_configuraciones_usuario_email ON configuraciones_usuario(email_usuario);
CREATE INDEX IF NOT EXISTS idx_archivos_multimedia_email ON archivos_multimedia(email_usuario);
CREATE INDEX IF NOT EXISTS idx_registros_actividad_email ON registros_actividad(email_usuario);
CREATE INDEX IF NOT EXISTS idx_metadatos_seo_entidad ON metadatos_seo(tipo_entidad, id_entidad);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualización automática de timestamps
CREATE TRIGGER IF NOT EXISTS trigger_usuarios_actualizado 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER IF NOT EXISTS trigger_productos_actualizado 
    BEFORE UPDATE ON productos 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER IF NOT EXISTS trigger_colecciones_actualizado 
    BEFORE UPDATE ON colecciones 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER IF NOT EXISTS trigger_clientes_actualizado 
    BEFORE UPDATE ON clientes 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER IF NOT EXISTS trigger_pedidos_actualizado 
    BEFORE UPDATE ON pedidos 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER IF NOT EXISTS trigger_promociones_actualizado 
    BEFORE UPDATE ON promociones 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER IF NOT EXISTS trigger_configuracion_shopify_actualizado 
    BEFORE UPDATE ON configuracion_shopify 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER IF NOT EXISTS trigger_configuraciones_usuario_actualizado 
    BEFORE UPDATE ON configuraciones_usuario 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER IF NOT EXISTS trigger_configuraciones_aplicacion_actualizado 
    BEFORE UPDATE ON configuraciones_aplicacion 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER IF NOT EXISTS trigger_metadatos_seo_actualizado 
    BEFORE UPDATE ON metadatos_seo 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- Datos iniciales
INSERT INTO configuraciones_aplicacion (clave, valor, descripcion) VALUES 
('nombre_aplicacion', '"GestionGranito"', 'Nombre de la aplicación'),
('version', '"1.0.0"', 'Versión actual de la aplicación'),
('modo_mantenimiento', 'false', 'Indica si la aplicación está en mantenimiento'),
('tamano_maximo_archivo', '10485760', 'Tamaño máximo de archivo en bytes (10MB)'),
('tipos_archivo_permitidos', '["image/jpeg", "image/png", "image/gif", "image/webp"]', 'Tipos de archivo permitidos para subir')
ON CONFLICT (clave) DO NOTHING;

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (email, nombre, rol, email_verificado, esta_activo) VALUES 
('admin@gestiongranito.com', 'Administrador', 'administrador', true, true)
ON CONFLICT (email) DO NOTHING;
