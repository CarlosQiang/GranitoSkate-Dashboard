import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { initializeDatabase } from "@/lib/db/init-db"

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Crear tabla de productos si no existe
    // await sql.query(`
    //   CREATE TABLE IF NOT EXISTS productos (
    //     id SERIAL PRIMARY KEY,
    //     shopify_id VARCHAR(255) UNIQUE,
    //     titulo VARCHAR(255) NOT NULL,
    //     descripcion TEXT,
    //     tipo_producto VARCHAR(100),
    //     proveedor VARCHAR(100),
    //     estado VARCHAR(50),
    //     publicado BOOLEAN DEFAULT false,
    //     destacado BOOLEAN DEFAULT false,
    //     etiquetas JSONB,
    //     imagen_destacada_url VARCHAR(255),
    //     precio_base DECIMAL(10, 2),
    //     precio_comparacion DECIMAL(10, 2),
    //     sku VARCHAR(100),
    //     codigo_barras VARCHAR(100),
    //     inventario_disponible INTEGER,
    //     politica_inventario VARCHAR(50),
    //     requiere_envio BOOLEAN DEFAULT true,
    //     peso DECIMAL(10, 2),
    //     unidad_peso VARCHAR(10) DEFAULT 'kg',
    //     seo_titulo VARCHAR(255),
    //     seo_descripcion TEXT,
    //     url_handle VARCHAR(255),
    //     fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     fecha_publicacion TIMESTAMP,
    //     ultima_sincronizacion TIMESTAMP
    //   )
    // `)

    // // Crear tabla de promociones si no existe
    // await sql.query(`
    //   CREATE TABLE IF NOT EXISTS promociones (
    //     id SERIAL PRIMARY KEY,
    //     shopify_id VARCHAR(255) UNIQUE,
    //     titulo VARCHAR(255) NOT NULL,
    //     descripcion TEXT,
    //     tipo VARCHAR(50) NOT NULL,
    //     valor DECIMAL(10, 2),
    //     codigo VARCHAR(100),
    //     objetivo VARCHAR(50),
    //     objetivo_id VARCHAR(255),
    //     condiciones JSONB,
    //     fecha_inicio TIMESTAMP,
    //     fecha_fin TIMESTAMP,
    //     activa BOOLEAN DEFAULT false,
    //     limite_uso INTEGER,
    //     contador_uso INTEGER DEFAULT 0,
    //     es_automatica BOOLEAN DEFAULT false,
    //     fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     ultima_sincronizacion TIMESTAMP
    //   )
    // `)

    // // Crear tabla de registro de sincronización si no existe
    // await sql.query(`
    //   CREATE TABLE IF NOT EXISTS registro_sincronizacion (
    //     id SERIAL PRIMARY KEY,
    //     tipo_entidad VARCHAR(50) NOT NULL,
    //     entidad_id VARCHAR(255),
    //     accion VARCHAR(50) NOT NULL,
    //     resultado VARCHAR(50) NOT NULL,
    //     mensaje TEXT,
    //     detalles JSONB,
    //     fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   )
    // `)

    // return NextResponse.json({ success: true, message: "Base de datos inicializada correctamente" })
    return NextResponse.json({ success: true, message: "POST method disabled" })
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    return NextResponse.json({ error: "Error al inicializar la base de datos" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Inicializar la base de datos
    const result = await initializeDatabase()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error al inicializar la base de datos: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}
