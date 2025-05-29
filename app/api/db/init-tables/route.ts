import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("🔧 Inicializando tablas de la base de datos...")

    // Crear tabla productos
    await sql`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE NOT NULL,
        titulo VARCHAR(500) NOT NULL,
        descripcion TEXT,
        estado VARCHAR(50) DEFAULT 'ACTIVE',
        precio_base DECIMAL(10,2) DEFAULT 0,
        inventario_disponible INTEGER DEFAULT 0,
        tipo_producto VARCHAR(100),
        proveedor VARCHAR(255),
        imagen_destacada_url TEXT,
        url_handle VARCHAR(255),
        publicado BOOLEAN DEFAULT true,
        creado_en TIMESTAMP DEFAULT NOW(),
        actualizado_en TIMESTAMP DEFAULT NOW()
      );
    `

    // Crear tabla clientes
    await sql`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        nombre VARCHAR(255),
        telefono VARCHAR(50),
        estado VARCHAR(50) DEFAULT 'ENABLED',
        total_pedidos INTEGER DEFAULT 0,
        total_gastado DECIMAL(10,2) DEFAULT 0,
        creado_en TIMESTAMP DEFAULT NOW(),
        actualizado_en TIMESTAMP DEFAULT NOW()
      );
    `

    // Crear tabla pedidos
    await sql`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE NOT NULL,
        numero_pedido VARCHAR(100),
        total DECIMAL(10,2) DEFAULT 0,
        moneda VARCHAR(10) DEFAULT 'EUR',
        email_cliente VARCHAR(255),
        estado VARCHAR(50),
        estado_financiero VARCHAR(50),
        creado_en TIMESTAMP DEFAULT NOW(),
        actualizado_en TIMESTAMP DEFAULT NOW()
      );
    `

    // Crear tabla colecciones
    await sql`
      CREATE TABLE IF NOT EXISTS colecciones (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE NOT NULL,
        titulo VARCHAR(500) NOT NULL,
        descripcion TEXT,
        url_handle VARCHAR(255),
        imagen_url TEXT,
        productos_count INTEGER DEFAULT 0,
        publicado BOOLEAN DEFAULT true,
        creado_en TIMESTAMP DEFAULT NOW(),
        actualizado_en TIMESTAMP DEFAULT NOW()
      );
    `

    // Crear tabla promociones
    await sql`
      CREATE TABLE IF NOT EXISTS promociones (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE NOT NULL,
        titulo VARCHAR(500) NOT NULL,
        descripcion TEXT,
        tipo VARCHAR(50),
        valor DECIMAL(10,2) DEFAULT 0,
        codigo VARCHAR(100),
        activo BOOLEAN DEFAULT false,
        fecha_inicio TIMESTAMP,
        creado_en TIMESTAMP DEFAULT NOW(),
        actualizado_en TIMESTAMP DEFAULT NOW()
      );
    `

    console.log("✅ Tablas inicializadas correctamente")

    return NextResponse.json({
      success: true,
      message: "Tablas inicializadas correctamente",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error inicializando tablas:", error)
    return NextResponse.json(
      {
        error: "Error al inicializar las tablas",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
