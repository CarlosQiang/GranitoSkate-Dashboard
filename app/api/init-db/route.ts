import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Función simple para generar un hash de contraseña (no seguro, solo para desarrollo)
function simpleHash(password: string): string {
  // Este es el hash conocido de "GranitoSkate" generado previamente con bcrypt
  return "$2b$10$1X.GQIJJk8L9Fz3HZhQQo.6EsHgHKm7Brx0bKQA9fI.SSjN.ym3Uy"
}

export async function GET() {
  try {
    // Verificar si existe la tabla de administradores
    const adminTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'administradores'
      ) as exists
    `

    if (!(adminTableExists as any)[0].exists) {
      // Crear tabla de administradores
      await prisma.$executeRaw`
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
    }

    // Verificar si existe el usuario admin
    const adminExists = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM administradores WHERE nombre_usuario = 'admin'
    `

    if ((adminExists as any)[0].count === 0) {
      // Crear usuario admin con hash predefinido
      const hashedPassword = simpleHash("GranitoSkate")

      await prisma.$executeRaw`
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

      return NextResponse.json({
        status: "success",
        message: "Base de datos inicializada y usuario admin creado",
        adminCreated: true,
      })
    }

    return NextResponse.json({
      status: "success",
      message: "Base de datos ya inicializada",
      adminCreated: false,
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
