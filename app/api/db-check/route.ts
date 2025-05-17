import { NextResponse } from "next/server"
import { checkConnection, query } from "@/lib/db/neon"

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
        },
        { status: 500 },
      )
    }

    // Verificar tablas existentes
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

    // Verificar si existe la tabla de administradores
    const adminTableResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'administradores'
      ) as exists
    `)

    // Verificar si existe el usuario admin
    let adminExists = false
    let adminData = null

    if (adminTableResult.rows[0].exists) {
      const adminUserResult = await query(`
        SELECT id, nombre_usuario, correo_electronico, activo 
        FROM administradores 
        WHERE nombre_usuario = 'admin'
      `)

      adminExists = adminUserResult.rowCount > 0
      adminData = adminExists ? adminUserResult.rows[0] : null
    }

    // Obtener variables de entorno (sin valores sensibles)
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? "***configurado***" : "no configurado",
      POSTGRES_URL: process.env.POSTGRES_URL ? "***configurado***" : "no configurado",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "***configurado***" : "no configurado",
      NODE_ENV: process.env.NODE_ENV,
    }

    return NextResponse.json({
      status: "success",
      connection: connectionStatus,
      database: {
        tables: tablesResult.rows,
        adminTableExists: adminTableResult.rows[0].exists,
        adminUserExists: adminExists,
        adminUser: adminData,
      },
      environment: envVars,
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
