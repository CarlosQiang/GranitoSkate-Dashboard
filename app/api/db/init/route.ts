import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Crear tabla de administradores si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS administradores (
        id SERIAL PRIMARY KEY,
        nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
        correo_electronico VARCHAR(100) UNIQUE NOT NULL,
        contrasena VARCHAR(255) NOT NULL,
        nombre_completo VARCHAR(100) NOT NULL,
        rol VARCHAR(20) NOT NULL DEFAULT 'admin',
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        ultimo_acceso TIMESTAMP,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de registro_sincronizacion si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS registro_sincronizacion (
        id SERIAL PRIMARY KEY,
        tipo_entidad VARCHAR(50) NOT NULL,
        entidad_id VARCHAR(255),
        accion VARCHAR(50) NOT NULL,
        resultado VARCHAR(50) NOT NULL,
        mensaje TEXT,
        detalles JSONB,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de productos si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255),
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2),
        inventario INTEGER,
        imagen_url TEXT,
        datos_adicionales JSONB,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de colecciones si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS colecciones (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255),
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        imagen_url TEXT,
        datos_adicionales JSONB,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de clientes si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255),
        email VARCHAR(255),
        nombre VARCHAR(255),
        telefono VARCHAR(50),
        datos_adicionales JSONB,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de pedidos si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255),
        cliente_id VARCHAR(255),
        total DECIMAL(10, 2),
        estado VARCHAR(50),
        datos_adicionales JSONB,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de promociones si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS promociones (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        tipo VARCHAR(50),
        valor DECIMAL(10, 2),
        fecha_inicio TIMESTAMP,
        fecha_fin TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE,
        datos_adicionales JSONB,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Verificar si ya existe un administrador
    const adminCheck = await query(`SELECT COUNT(*) FROM administradores`)

    // Si no hay administradores, crear uno por defecto
    if (adminCheck.rows[0].count === "0") {
      // Contraseña: admin123
      await query(`
        INSERT INTO administradores (
          nombre_usuario, correo_electronico, contrasena, nombre_completo, rol
        ) VALUES (
          'admin', 'admin@granitoskate.com', '$2a$10$X/4yCQ2Yx.J04/9fGJD.WOQs1BzGMKnHAxTHHQyHG3o1RhMUKEOdW', 'Administrador', 'admin'
        )
      `)
    }

    return NextResponse.json({
      success: true,
      message: "Base de datos inicializada correctamente",
    })
  } catch (error: any) {
    console.error("Error al inicializar la base de datos:", error)
    return NextResponse.json(
      {
        error: "Error al inicializar la base de datos",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
