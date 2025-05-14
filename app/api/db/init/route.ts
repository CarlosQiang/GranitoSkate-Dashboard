import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Verificar si la tabla de tutoriales existe
    const checkTableResult = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'tutoriales'
      );
    `

    const tableExists = checkTableResult.rows[0].exists

    if (!tableExists) {
      // Crear la tabla de tutoriales
      await sql`
        CREATE TABLE IF NOT EXISTS tutoriales (
          id SERIAL PRIMARY KEY,
          titulo VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE,
          descripcion TEXT,
          contenido TEXT,
          imagen_url VARCHAR(255),
          nivel_dificultad VARCHAR(50) DEFAULT 'principiante',
          tiempo_estimado INTEGER,
          categorias TEXT[],
          tags TEXT[],
          shopify_id VARCHAR(255),
          publicado BOOLEAN DEFAULT false,
          destacado BOOLEAN DEFAULT false,
          autor_id INTEGER,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_publicacion TIMESTAMP,
          metadatos JSONB,
          ultima_sincronizacion TIMESTAMP
        );
      `

      // Crear la tabla de registro de sincronización
      await sql`
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
      `

      return NextResponse.json({
        status: "success",
        message: "Tablas creadas correctamente",
      })
    }

    return NextResponse.json({
      status: "success",
      message: "Las tablas ya existen",
    })
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)

    return NextResponse.json(
      {
        status: "error",
        message: `Error al inicializar la base de datos: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}
