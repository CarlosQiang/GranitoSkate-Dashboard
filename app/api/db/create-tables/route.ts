import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Crear tabla de productos
    await sql`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        estado VARCHAR(50),
        tipo VARCHAR(100),
        proveedor VARCHAR(100),
        handle VARCHAR(255),
        etiquetas TEXT,
        precio DECIMAL(10, 2),
        precio_comparacion DECIMAL(10, 2),
        sku VARCHAR(100),
        inventario INTEGER,
        imagen_url TEXT,
        datos_adicionales JSONB,
        creado_en TIMESTAMP NOT NULL,
        actualizado_en TIMESTAMP NOT NULL
      )
    `

    // Crear tabla de colecciones
    await sql`
      CREATE TABLE IF NOT EXISTS colecciones (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        handle VARCHAR(255),
        productos_count INTEGER,
        imagen_url TEXT,
        datos_adicionales JSONB,
        creado_en TIMESTAMP NOT NULL,
        actualizado_en TIMESTAMP NOT NULL
      )
    `

    // Crear tabla de clientes
    await sql`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        nombre VARCHAR(100),
        apellido VARCHAR(100),
        email VARCHAR(255),
        telefono VARCHAR(50),
        nombre_completo VARCHAR(255),
        pedidos_count INTEGER,
        total_gastado DECIMAL(10, 2),
        datos_adicionales JSONB,
        creado_en TIMESTAMP NOT NULL,
        actualizado_en TIMESTAMP NOT NULL
      )
    `

    // Crear tabla de pedidos
    await sql`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        numero_pedido VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        telefono VARCHAR(50),
        precio_total DECIMAL(10, 2),
        subtotal DECIMAL(10, 2),
        impuestos DECIMAL(10, 2),
        envio DECIMAL(10, 2),
        estado_financiero VARCHAR(50),
        estado_envio VARCHAR(50),
        fecha_procesado TIMESTAMP,
        cliente_id VARCHAR(255),
        cliente_nombre VARCHAR(255),
        datos_adicionales JSONB,
        creado_en TIMESTAMP NOT NULL,
        actualizado_en TIMESTAMP NOT NULL
      )
    `

    // Crear tabla de registro de sincronización
    await sql`
      CREATE TABLE IF NOT EXISTS registro_sincronizacion (
        id SERIAL PRIMARY KEY,
        tipo_entidad VARCHAR(50) NOT NULL,
        entidad_id VARCHAR(255),
        accion VARCHAR(50) NOT NULL,
        resultado VARCHAR(50) NOT NULL,
        mensaje TEXT,
        detalles JSONB,
        fecha TIMESTAMP NOT NULL
      )
    `

    return NextResponse.json({
      success: true,
      message: "Tablas creadas correctamente",
    })
  } catch (error: any) {
    console.error("Error al crear tablas:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al crear tablas",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
