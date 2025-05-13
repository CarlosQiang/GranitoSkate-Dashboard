-- Crear tabla de administradores
CREATE TABLE IF NOT EXISTS administradores (
  id SERIAL PRIMARY KEY,
  nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
  correo_electronico VARCHAR(100) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(100),
  rol VARCHAR(20) NOT NULL DEFAULT 'admin',
  activo BOOLEAN NOT NULL DEFAULT true,
  ultimo_acceso TIMESTAMP,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_administradores_correo ON administradores(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_administradores_usuario ON administradores(nombre_usuario);

-- Insertar administrador por defecto (contraseña: Granitoskate)
-- La contraseña está hasheada con bcrypt
INSERT INTO administradores (nombre_usuario, correo_electronico, contrasena, nombre_completo, rol)
VALUES 
  ('admin', 'administrador@gmail.com', '$2b$12$1X.GQIJJk8L9Fz3HZhQQo.6EsHgHKm7Brx0bKQA9fI.SSjN.ym3Uy', 'Administrador Principal', 'superadmin')
ON CONFLICT (nombre_usuario) DO NOTHING;
