import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Verificar si existe la tabla de administradores
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'administradores'
      ) as exists
    `

    if (!(tableExists as any)[0].exists) {
      // La tabla no existe, necesitamos crearla manualmente
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS administradores (
          id SERIAL PRIMARY KEY,
          nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
          correo_electronico VARCHAR(100) UNIQUE NOT NULL,
          contrasena VARCHAR(255) NOT NULL,
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
    const adminExists = await prisma.administradores.findFirst({
      where: {
        nombre_usuario: "admin",
      },
    })

    if (!adminExists) {
      // Crear usuario admin
      await prisma.administradores.create({
        data: {
          nombre_usuario: "admin",
          correo_electronico: "admin@granitoskate.com",
          contrasena: "$2b$10$1X.GQIJJk8L9Fz3HZhQQo.6EsHgHKm7Brx0bKQA9fI.SSjN.ym3Uy", // Hash de "GranitoSkate"
          nombre_completo: "Administrador Principal",
          rol: "superadmin",
          activo: true,
          fecha_creacion: new Date(),
        },
      })
    }

    return NextResponse.json({
      status: "success",
      message: "Base de datos inicializada correctamente",
      adminCreated: !adminExists,
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
