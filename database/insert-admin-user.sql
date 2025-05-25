-- Script separado para insertar solo el usuario admin
-- Ejecutar después de crear las tablas

-- Hash de la contraseña 'GranitoSkate' con bcrypt (salt rounds: 12)
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
  '$2a$12$8K1p/a0drtIWinNiEkgzLOxwIDOXBgZdyQiW4OEKlOa6UYIL6PFDa',  -- GranitoSkate
  'Administrador Principal',
  'admin',
  true
) ON CONFLICT (nombre_usuario) DO UPDATE SET
  correo_electronico = EXCLUDED.correo_electronico,
  contrasena = EXCLUDED.contrasena,
  nombre_completo = EXCLUDED.nombre_completo,
  activo = EXCLUDED.activo,
  fecha_actualizacion = CURRENT_TIMESTAMP;

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
