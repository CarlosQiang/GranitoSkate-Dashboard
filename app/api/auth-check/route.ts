import { NextResponse } from "next/server"
import { Pool } from "pg"

export async function GET() {
  try {
    // Configuración de la conexión a la base de datos
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ssl: true,
    })

    // Verificar conexión
    const client = await pool.connect()
    try {
      // Verificar si la tabla existe
      const tableCheck = await client.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'administradores')",
      )

      const tableExists = tableCheck.rows[0].exists

      let adminExists = false
      let adminCount = 0

      if (tableExists) {
        // Verificar si existe el usuario admin
        const adminCheck = await client.query("SELECT COUNT(*) FROM administradores WHERE nombre_usuario = 'admin'")
        adminExists = Number.parseInt(adminCheck.rows[0].count) > 0

        // Contar administradores
        const countCheck = await client.query("SELECT COUNT(*) FROM administradores")
        adminCount = Number.parseInt(countCheck.rows[0].count)
      }

      // Verificar variables de entorno
      const envVars = {
        DATABASE_URL: !!process.env.DATABASE_URL,
        POSTGRES_URL: !!process.env.POSTGRES_URL,
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
      }

      return NextResponse.json({
        status: "success",
        connection: "ok",
        database: {
          tableExists,
          adminExists,
          adminCount,
        },
        environment: envVars,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error al verificar la autenticación:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido",
        connection: "failed",
      },
      { status: 500 },
    )
  }
}
