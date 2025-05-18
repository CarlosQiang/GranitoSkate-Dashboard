import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hashPassword } from "@/lib/auth-service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Verificar si existe la tabla de administradores
    const adminTableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'administradores'
      ) as exists
    `)

    if (!adminTableExists.rows[0].exists) {
      // Crear tabla de administradores
      await query(`
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
      `)
    }

    // Verificar si existe la tabla de registro_sincronizacion
    const syncTableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'registro_sincronizacion'
      ) as exists
    `)

    if (!syncTableExists.rows[0].exists) {
      // Crear tabla de registro_sincronizacion
      await query(`
        CREATE TABLE IF NOT EXISTS registro_sincronizacion (
          id SERIAL PRIMARY KEY,
          tipo_entidad VARCHAR(50),
          entidad_id VARCHAR(255),
          accion VARCHAR(50),
          resultado VARCHAR(50),
          mensaje TEXT,
          detalles JSON,
          fecha TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `)
    }

    // Crear tablas simplificadas
    await query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255),
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2),
        inventario INTEGER DEFAULT 0,
        imagen_url TEXT,
        datos_adicionales JSON,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP
      )
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS colecciones (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255),
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        imagen_url TEXT,
        datos_adicionales JSON,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP
      )
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255),
        email VARCHAR(255),
        nombre VARCHAR(255),
        telefono VARCHAR(50),
        datos_adicionales JSON,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP
      )
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255),
        cliente_id VARCHAR(255),
        total DECIMAL(10, 2),
        estado VARCHAR(50),
        datos_adicionales JSON,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP
      )
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS promociones (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        tipo VARCHAR(50),
        valor DECIMAL(10, 2),
        fecha_inicio TIMESTAMP,
        fecha_fin TIMESTAMP,
        activa BOOLEAN DEFAULT true,
        datos_adicionales JSON,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP
      )
    `)

    // Verificar si existe el usuario admin
    const adminExists = await query(`
      SELECT COUNT(*) as count FROM administradores WHERE nombre_usuario = 'admin'
    `)

    if (adminExists.rows[0].count === "0") {
      // Crear usuario admin
      const hashedPassword = await hashPassword("GranitoSkate")

      await query(
        `
        INSERT INTO administradores (
          nombre_usuario, 
          correo_electronico, 
          contrasena, 
          nombre_completo, 
          rol, 
          activo
        ) VALUES (
          'admin', 
          'admin@granitoskate.com', 
          $1, 
          'Administrador', 
          'superadmin', 
          true
        )
      `,
        [hashedPassword],
      )

      return NextResponse.json({
        status: "success",
        message: "Base de datos inicializada y usuario admin creado",
        adminCreated: true,
      })
    }

    return NextResponse.json({
      status: "success",
      message: "Base de datos inicializada",
      adminCreated: false,
    })
  } catch (error: any) {
    console.error("Error al inicializar la base de datos:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Error desconocido",
        stack: error.stack || null,
      },
      { status: 500 },
    )
  }
}
