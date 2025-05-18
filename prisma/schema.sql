-- Tabla de administradores
CREATE TABLE IF NOT EXISTS administradores (
  id SERIAL PRIMARY KEY,
  nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre_completo VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(100) NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'admin',
  activo BOOLEAN NOT NULL DEFAULT true,
  ultimo_acceso TIMESTAMP,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_producto VARCHAR(100),
  proveedor VARCHAR(100),
  estado VARCHAR(50),
  publicado BOOLEAN NOT NULL DEFAULT false,
  destacado BOOLEAN NOT NULL DEFAULT false,
  etiquetas TEXT[],
  imagen_destacada_url TEXT,
  precio_base DECIMAL(10, 2),
  precio_comparacion DECIMAL(10, 2),
  sku VARCHAR(100),
  codigo_barras VARCHAR(100),
  inventario_disponible INTEGER,
  politica_inventario VARCHAR(50),
  requiere_envio BOOLEAN NOT NULL DEFAULT true,
  peso DECIMAL(10, 2),
  unidad_peso VARCHAR(10) DEFAULT 'kg',
  seo_titulo VARCHAR(255),
  seo_descripcion TEXT,
  url_handle VARCHAR(255),
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_publicacion TIMESTAMP,
  ultima_sincronizacion TIMESTAMP
);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_shopify_id ON productos(shopify_id);
CREATE INDEX IF NOT EXISTS idx_productos_url_handle ON productos(url_handle);

-- Tabla de variantes de producto
CREATE TABLE IF NOT EXISTS variantes_producto (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  precio DECIMAL(10, 2),
  precio_comparacion DECIMAL(10, 2),
  sku VARCHAR(100),
  codigo_barras VARCHAR(100),
  inventario_disponible INTEGER,
  politica_inventario VARCHAR(50),
  requiere_envio BOOLEAN NOT NULL DEFAULT true,
  peso DECIMAL(10, 2),
  unidad_peso VARCHAR(10) DEFAULT 'kg',
  opcion1_nombre VARCHAR(100),
  opcion1_valor VARCHAR(100),
  opcion2_nombre VARCHAR(100),
  opcion2_valor VARCHAR(100),
  opcion3_nombre VARCHAR(100),
  opcion3_valor VARCHAR(100),
  posicion INTEGER,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_sincronizacion TIMESTAMP
);

-- Índices para variantes
CREATE INDEX IF NOT EXISTS idx_variantes_shopify_id ON variantes_producto(shopify_id);
CREATE INDEX IF NOT EXISTS idx_variantes_producto_id ON variantes_producto(producto_id);
CREATE INDEX IF NOT EXISTS idx_variantes_sku ON variantes_producto(sku);

-- Tabla de imágenes de producto
CREATE TABLE IF NOT EXISTS imagenes_producto (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  variante_id INTEGER REFERENCES variantes_producto(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  texto_alternativo VARCHAR(255),
  posicion INTEGER,
  es_destacada BOOLEAN NOT NULL DEFAULT false,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_sincronizacion TIMESTAMP
);

-- Índices para imágenes
CREATE INDEX IF NOT EXISTS idx_imagenes_shopify_id ON imagenes_producto(shopify_id);
CREATE INDEX IF NOT EXISTS idx_imagenes_producto_id ON imagenes_producto(producto_id);
CREATE INDEX IF NOT EXISTS idx_imagenes_variante_id ON imagenes_producto(variante_id);

-- Tabla de colecciones
CREATE TABLE IF NOT EXISTS colecciones (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  url_handle VARCHAR(255),
  imagen_url TEXT,
  es_automatica BOOLEAN NOT NULL DEFAULT false,
  condiciones_automaticas JSONB,
  publicada BOOLEAN NOT NULL DEFAULT false,
  seo_titulo VARCHAR(255),
  seo_descripcion TEXT,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_publicacion TIMESTAMP,
  ultima_sincronizacion TIMESTAMP
);

-- Índices para colecciones
CREATE INDEX IF NOT EXISTS idx_colecciones_shopify_id ON colecciones(shopify_id);
CREATE INDEX IF NOT EXISTS idx_colecciones_url_handle ON colecciones(url_handle);

-- Tabla de relación productos-colecciones
CREATE TABLE IF NOT EXISTS productos_colecciones (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  coleccion_id INTEGER NOT NULL REFERENCES colecciones(id) ON DELETE CASCADE,
  posicion INTEGER,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(producto_id, coleccion_id)
);

-- Índices para productos-colecciones
CREATE INDEX IF NOT EXISTS idx_productos_colecciones_producto_id ON productos_colecciones(producto_id);
CREATE INDEX IF NOT EXISTS idx_productos_colecciones_coleccion_id ON productos_colecciones(coleccion_id);

-- Tabla de promociones
CREATE TABLE IF NOT EXISTS promociones (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL,
  valor DECIMAL(10, 2),
  codigo VARCHAR(100),
  objetivo VARCHAR(50),
  objetivo_id VARCHAR(255),
  condiciones JSONB,
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  activa BOOLEAN NOT NULL DEFAULT false,
  limite_uso INTEGER,
  contador_uso INTEGER NOT NULL DEFAULT 0,
  es_automatica BOOLEAN NOT NULL DEFAULT false,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_sincronizacion TIMESTAMP
);

-- Índices para promociones
CREATE INDEX IF NOT EXISTS idx_promociones_shopify_id ON promociones(shopify_id);
CREATE INDEX IF NOT EXISTS idx_promociones_codigo ON promociones(codigo);

-- Tabla de mercados
CREATE TABLE IF NOT EXISTS mercados (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  es_principal BOOLEAN NOT NULL DEFAULT false,
  moneda_codigo VARCHAR(10),
  moneda_simbolo VARCHAR(10),
  dominio VARCHAR(255),
  subfolder_sufijo VARCHAR(50),
  paises TEXT[],
  idiomas JSONB,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_sincronizacion TIMESTAMP
);

-- Índices para mercados
CREATE INDEX IF NOT EXISTS idx_mercados_shopify_id ON mercados(shopify_id);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  email VARCHAR(255),
  nombre VARCHAR(100),
  apellidos VARCHAR(100),
  telefono VARCHAR(50),
  acepta_marketing BOOLEAN NOT NULL DEFAULT false,
  notas TEXT,
  etiquetas TEXT[],
  total_pedidos INTEGER NOT NULL DEFAULT 0,
  total_gastado DECIMAL(10, 2) NOT NULL DEFAULT 0,
  estado VARCHAR(50),
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_sincronizacion TIMESTAMP
);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_shopify_id ON clientes(shopify_id);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);

-- Tabla de direcciones de cliente
CREATE TABLE IF NOT EXISTS direcciones_cliente (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  es_predeterminada BOOLEAN NOT NULL DEFAULT false,
  nombre VARCHAR(100),
  apellidos VARCHAR(100),
  empresa VARCHAR(100),
  direccion1 VARCHAR(255),
  direccion2 VARCHAR(255),
  ciudad VARCHAR(100),
  provincia VARCHAR(100),
  codigo_postal VARCHAR(20),
  pais VARCHAR(100),
  codigo_pais VARCHAR(10),
  telefono VARCHAR(50),
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_sincronizacion TIMESTAMP
);

-- Índices para direcciones
CREATE INDEX IF NOT EXISTS idx_direcciones_shopify_id ON direcciones_cliente(shopify_id);
CREATE INDEX IF NOT EXISTS idx_direcciones_cliente_id ON direcciones_cliente(cliente_id);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  numero_pedido VARCHAR(50),
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  email_cliente VARCHAR(255),
  estado VARCHAR(50),
  estado_financiero VARCHAR(50),
  estado_cumplimiento VARCHAR(50),
  moneda VARCHAR(10),
  subtotal DECIMAL(10, 2),
  impuestos DECIMAL(10, 2),
  envio DECIMAL(10, 2),
  descuentos DECIMAL(10, 2),
  total DECIMAL(10, 2),
  ip_cliente VARCHAR(50),
  navegador_cliente VARCHAR(255),
  notas TEXT,
  etiquetas TEXT[],
  riesgo_fraude VARCHAR(50),
  cancelado BOOLEAN NOT NULL DEFAULT false,
  fecha_cancelacion TIMESTAMP,
  motivo_cancelacion VARCHAR(255),
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_procesamiento TIMESTAMP,
  ultima_sincronizacion TIMESTAMP
);

-- Índices para pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_shopify_id ON pedidos(shopify_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_email_cliente ON pedidos(email_cliente);

-- Tabla de líneas de pedido
CREATE TABLE IF NOT EXISTS lineas_pedido (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
  variante_id INTEGER REFERENCES variantes_producto(id) ON DELETE SET NULL,
  titulo VARCHAR(255),
  variante_titulo VARCHAR(255),
  sku VARCHAR(100),
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio DECIMAL(10, 2),
  descuento DECIMAL(10, 2),
  total DECIMAL(10, 2),
  requiere_envio BOOLEAN NOT NULL DEFAULT true,
  impuesto DECIMAL(10, 2),
  propiedades JSONB,
  estado_cumplimiento VARCHAR(50),
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_sincronizacion TIMESTAMP
);

-- Índices para líneas de pedido
CREATE INDEX IF NOT EXISTS idx_lineas_pedido_shopify_id ON lineas_pedido(shopify_id);
CREATE INDEX IF NOT EXISTS idx_lineas_pedido_pedido_id ON lineas_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_lineas_pedido_producto_id ON lineas_pedido(producto_id);
CREATE INDEX IF NOT EXISTS idx_lineas_pedido_variante_id ON lineas_pedido(variante_id);

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS transacciones (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  tipo VARCHAR(50),
  estado VARCHAR(50),
  pasarela_pago VARCHAR(100),
  monto DECIMAL(10, 2),
  moneda VARCHAR(10),
  error_codigo VARCHAR(50),
  error_mensaje TEXT,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_sincronizacion TIMESTAMP
);

-- Índices para transacciones
CREATE INDEX IF NOT EXISTS idx_transacciones_shopify_id ON transacciones(shopify_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_pedido_id ON transacciones(pedido_id);

-- Tabla de envíos
CREATE TABLE IF NOT EXISTS envios (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  estado VARCHAR(50),
  servicio_envio VARCHAR(100),
  numero_seguimiento VARCHAR(100),
  url_seguimiento TEXT,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega TIMESTAMP,
  ultima_sincronizacion TIMESTAMP
);

-- Índices para envíos
CREATE INDEX IF NOT EXISTS idx_envios_shopify_id ON envios(shopify_id);
CREATE INDEX IF NOT EXISTS idx_envios_pedido_id ON envios(pedido_id);

-- Tabla de metadatos
CREATE TABLE IF NOT EXISTS metadatos (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255),
  tipo_propietario VARCHAR(50) NOT NULL,
  propietario_id INTEGER NOT NULL,
  shopify_propietario_id VARCHAR(255),
  namespace VARCHAR(100) NOT NULL,
  clave VARCHAR(100) NOT NULL,
  valor TEXT,
  tipo_valor VARCHAR(50),
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_sincronizacion TIMESTAMP,
  UNIQUE(tipo_propietario, propietario_id, namespace, clave)
);

-- Índices para metadatos
CREATE INDEX IF NOT EXISTS idx_metadatos_shopify_id ON metadatos(shopify_id);
CREATE INDEX IF NOT EXISTS idx_metadatos_propietario ON metadatos(tipo_propietario, propietario_id);

-- Tabla de registro de sincronización
CREATE TABLE IF NOT EXISTS registro_sincronizacion (
  id SERIAL PRIMARY KEY,
  tipo_entidad VARCHAR(50) NOT NULL,
  entidad_id VARCHAR(255),
  accion VARCHAR(50) NOT NULL,
  resultado VARCHAR(50) NOT NULL,
  mensaje TEXT,
  detalles JSONB,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para registro de sincronización
CREATE INDEX IF NOT EXISTS idx_registro_tipo_entidad ON registro_sincronizacion(tipo_entidad);
CREATE INDEX IF NOT EXISTS idx_registro_entidad_id ON registro_sincronizacion(entidad_id);
CREATE INDEX IF NOT EXISTS idx_registro_resultado ON registro_sincronizacion(resultado);
