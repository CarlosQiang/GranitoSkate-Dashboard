import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const result = await prisma.$queryRaw`SELECT NOW() as time`

    // Verificar tabla de administradores
    const adminTable = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'administradores'
      ) as exists
    `

    // Verificar usuario admin
    let adminExists = false
    let adminData = null

    if ((adminTable as any)[0].exists) {
      const adminUser = await prisma.$queryRaw`
        SELECT id, nombre_usuario, correo_electronico, activo 
        FROM administradores 
        WHERE nombre_usuario = 'admin'
      `
      adminExists = (adminUser as any).length > 0
      adminData = adminExists ? (adminUser as any)[0] : null
    }

    return NextResponse.json({
      status: "success",
      connection: {
        connected: true,
        time: result[0].time,
      },
      database: {
        adminTableExists: (adminTable as any)[0].exists,
        adminUserExists: adminExists,
        adminUser: adminData,
      },
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? "Configurado" : "No configurado",
        POSTGRES_URL: process.env.POSTGRES_URL ? "Configurado" : "No configurado",
        NODE_ENV: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("Error al verificar la base de datos:", error)
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
