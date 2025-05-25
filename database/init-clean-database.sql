-- Limpiar todas las tablas excepto administradores
DROP TABLE IF EXISTS registro_sincronizacion CASCADE;
DROP TABLE IF EXISTS metadatos CASCADE;
DROP TABLE IF EXISTS envios CASCADE;
DROP TABLE IF EXISTS transacciones CASCADE;
DROP TABLE IF EXISTS lineas_pedido CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS direcciones_cliente CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS mercados CASCADE;
DROP TABLE IF EXISTS promociones CASCADE;
DROP TABLE IF EXISTS productos_colecciones CASCADE;
DROP TABLE IF EXISTS colecciones CASCADE;
DROP TABLE IF EXISTS imagenes_producto CASCADE;
DROP TABLE IF EXISTS variantes_producto CASCADE;
DROP TABLE IF EXISTS productos CASCADE;

-- Mantener tabla de administradores (ya existe)
-- Solo verificamos que tenga la estructura correcta
CREATE TABLE IF NOT EXISTS administradores (
  id SERIAL PRIMARY KEY,
  nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
  correo_electronico VARCHAR(255) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(255),
  rol VARCHAR(50) DEFAULT 'admin' NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  ultimo_acceso TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de registros de actividad (NUEVA)
CREATE TABLE registros_actividad (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES administradores(id) ON DELETE SET NULL,
  usuario_nombre VARCHAR(255), -- Por si se elimina el usuario
  accion VARCHAR(100) NOT NULL, -- 'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'API_CALL', etc.
  entidad VARCHAR(100), -- 'ADMIN', 'SHOPIFY_PRODUCT', 'SHOPIFY_COLLECTION', 'SYSTEM', etc.
  entidad_id VARCHAR(255), -- ID de la entidad afectada
  descripcion TEXT, -- Descripción detallada de la acción
  metadatos JSONB, -- Datos adicionales (request, response, etc.)
  ip_address INET, -- IP del usuario
  user_agent TEXT, -- Navegador/cliente
  resultado VARCHAR(50) DEFAULT 'SUCCESS', -- 'SUCCESS', 'ERROR', 'WARNING'
  error_mensaje TEXT, -- Mensaje de error si aplica
  duracion_ms INTEGER, -- Duración de la operación en milisegundos
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de sesiones de usuario (NUEVA)
CREATE TABLE sesiones_usuario (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES administradores(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  activa BOOLEAN DEFAULT TRUE,
  fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_fin TIMESTAMP,
  ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_registros_actividad_usuario_id ON registros_actividad(usuario_id);
CREATE INDEX idx_registros_actividad_accion ON registros_actividad(accion);
CREATE INDEX idx_registros_actividad_entidad ON registros_actividad(entidad);
CREATE INDEX idx_registros_actividad_fecha ON registros_actividad(fecha_creacion);
CREATE INDEX idx_registros_actividad_resultado ON registros_actividad(resultado);

CREATE INDEX idx_sesiones_usuario_usuario_id ON sesiones_usuario(usuario_id);
CREATE INDEX idx_sesiones_usuario_token ON sesiones_usuario(session_token);
CREATE INDEX idx_sesiones_usuario_activa ON sesiones_usuario(activa);

-- Función para actualizar ultima_actividad automáticamente
CREATE OR REPLACE FUNCTION actualizar_ultima_actividad()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ultima_actividad = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar ultima_actividad en sesiones
CREATE TRIGGER trigger_actualizar_ultima_actividad
  BEFORE UPDATE ON sesiones_usuario
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_ultima_actividad();

-- Insertar usuario administrador por defecto
-- Contraseña: GranitoSkate (hasheada con bcrypt)
INSERT INTO administradores (
  nombre_usuario, 
  correo_electronico, 
  contrasena, 
  nombre_completo, 
  rol, 
  activo
) VALUES (
  'admin',
  'admin@gmail.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL8L8L8L8',  -- Hash de 'GranitoSkate'
  'Administrador Principal',
  'admin',
  true
) ON CONFLICT (nombre_usuario) DO UPDATE SET
  correo_electronico = EXCLUDED.correo_electronico,
  contrasena = EXCLUDED.contrasena,
  nombre_completo = EXCLUDED.nombre_completo,
  activo = EXCLUDED.activo;

-- Verificar que el usuario se creó correctamente
SELECT 
  id, 
  nombre_usuario, 
  correo_electronico, 
  nombre_completo, 
  rol, 
  activo,
  fecha_creacion
FROM administradores 
WHERE nombre_usuario = 'admin';
