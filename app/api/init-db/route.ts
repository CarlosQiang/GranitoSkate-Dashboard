import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    console.log("Inicializando base de datos...")

    // Verificar si existe la tabla de administradores
    const adminTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'administradores'
      ) as exists
    `

    if (!(adminTableExists as any)[0].exists) {
      console.log("Creando tabla de administradores...")

      // Crear tabla de administradores
      await sql`
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
        )
      `

      console.log("Tabla de administradores creada.")
    } else {
      console.log("La tabla de administradores ya existe.")
    }

    // Verificar si existe la función para actualizar timestamp
    const functionExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'actualizar_timestamp'
      ) as exists
    `

    if (!(functionExists as any)[0].exists) {
      console.log("Creando función actualizar_timestamp...")

      await sql`
        CREATE FUNCTION actualizar_timestamp() RETURNS TRIGGER AS $$
        BEGIN
            NEW.fecha_actualizacion = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `

      console.log("Función actualizar_timestamp creada.")
    }

    // Verificar si existe el trigger
    const triggerExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_administradores_actualizado' 
        AND tgrelid = 'administradores'::regclass
      ) as exists
    `

    if (!(triggerExists as any)[0].exists) {
      console.log("Creando trigger para actualizar timestamp...")

      await sql`
        CREATE TRIGGER trigger_administradores_actualizado
        BEFORE UPDATE ON administradores
        FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp()
      `

      console.log("Trigger creado.")
    }

    // Verificar si existe el usuario admin
    const adminExists = await sql`
      SELECT COUNT(*) as count FROM administradores WHERE nombre_usuario = 'admin'
    `

    if ((adminExists as any)[0].count === 0) {
      console.log("Creando usuario administrador por defecto...")

      // Crear usuario admin con hash predefinido
      await sql`
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
        )
      `

      console.log("Usuario administrador creado.")
    } else {
      console.log("El usuario administrador ya existe.")
    }

    return NextResponse.json({
      status: "success",
      message: "Base de datos inicializada correctamente",
      adminCreated: (adminExists as any)[0].count === 0,
    })
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido",
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}
