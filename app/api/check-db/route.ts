import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Verificar la conexión a la base de datos
    const result = await prisma.$queryRaw`SELECT NOW() as time`

    // Verificar si existe la tabla de administradores
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'administradores'
      ) as exists
    `

    // Contar administradores
    let adminCount = 0
    if ((tableExists as any)[0].exists) {
      const countResult = await prisma.administradores.count()
      adminCount = countResult
    }

    return NextResponse.json({
      status: "success",
      connection: {
        connected: true,
        time: result,
      },
      database: {
        adminTableExists: (tableExists as any)[0].exists,
        adminCount,
      },
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ? "Configurado" : "No configurado",
        NODE_ENV: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("Error al verificar la base de datos:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido",
        environment: {
          DATABASE_URL: process.env.DATABASE_URL ? "Configurado" : "No configurado",
          NODE_ENV: process.env.NODE_ENV,
        },
      },
      { status: 500 },
    )
  }
}
