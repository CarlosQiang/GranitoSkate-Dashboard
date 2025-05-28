-- Crear tabla de administradores si no existe
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

-- Insertar administrador por defecto
-- La contraseña es "GranitoSkate" (hash predefinido)
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
    '$2a$10$1X.GQIJJk8L9Fz3HZhQQo.6EsHgHKm7Brx0bKQA9fI.SSjN.ym3Uy', 
    'Administrador', 
    'superadmin', 
    true
) ON CONFLICT (correo_electronico) DO NOTHING;

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_administradores_correo ON administradores(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_administradores_usuario ON administradores(nombre_usuario);

-- Primero, crear la función para actualizar el timestamp si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'actualizar_timestamp') THEN
        CREATE FUNCTION actualizar_timestamp() RETURNS TRIGGER AS $$
        BEGIN
            NEW.fecha_actualizacion = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    END IF;
END
$$;

-- Luego, verificar si el trigger ya existe antes de crearlo
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_administradores_actualizado' 
        AND tgrelid = 'administradores'::regclass
    ) THEN
        CREATE TRIGGER trigger_administradores_actualizado
        BEFORE UPDATE ON administradores
        FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
    END IF;
END
$$;
