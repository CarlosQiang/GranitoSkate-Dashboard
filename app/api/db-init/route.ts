import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { hash } from "bcryptjs"

export async function POST() {
  try {
    // Crear tabla de administradores si no existe
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

    // Verificar si existe el usuario admin
    const { rows: existingAdmin } = await sql`
      SELECT id FROM administradores WHERE nombre_usuario = 'admin'
    `

    // Si no existe, crear el usuario admin con la contraseña GranitoSkate
    if (existingAdmin.length === 0) {
      const hashedPassword = await hash("GranitoSkate", 10)

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
          'admin@granitoskate.com', 
          ${hashedPassword}, 
          'Administrador', 
          'superadmin', 
          true
        )
      `
    }

    return NextResponse.json({
      status: "success",
      message: "Base de datos inicializada correctamente",
      adminCreated: existingAdmin.length === 0,
    })
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
