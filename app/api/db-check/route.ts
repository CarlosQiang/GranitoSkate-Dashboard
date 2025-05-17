import { NextResponse } from "next/server"
import { checkConnection, sql } from "@/lib/db/neon"

export async function GET() {
  try {
    // Verificar conexión
    const connectionStatus = await checkConnection()

    if (!connectionStatus.connected) {
      return NextResponse.json(
        {
          status: "error",
          message: "No se pudo conectar a la base de datos",
          details: connectionStatus.error,
          env: {
            DATABASE_URL: process.env.DATABASE_URL ? "Configurado" : "No configurado",
            POSTGRES_URL: process.env.POSTGRES_URL ? "Configurado" : "No configurado",
          },
        },
        { status: 500 },
      )
    }

    // Verificar tablas
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    // Verificar usuario admin
    const adminExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'administradores'
      ) as exists
    `

    let adminCount = 0
    if (adminExists[0].exists) {
      const adminResult = await sql`SELECT COUNT(*) as count FROM administradores`
      adminCount = adminResult[0].count
    }

    return NextResponse.json({
      status: "success",
      connection: connectionStatus,
      tables: tables.map((t) => t.table_name),
      adminExists: adminExists[0].exists,
      adminCount,
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? "Configurado" : "No configurado",
        POSTGRES_URL: process.env.POSTGRES_URL ? "Configurado" : "No configurado",
        NODE_ENV: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("Error en el endpoint de verificación:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error inesperado",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
