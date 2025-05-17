import { NextResponse } from "next/server"
import { Pool } from "pg"

// Crear una conexión directa a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export async function GET() {
  try {
    // Verificar la conexión a la base de datos
    const start = Date.now()
    const result = await pool.query("SELECT NOW()")
    const duration = Date.now() - start

    // Obtener información sobre las tablas
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    const tables = tablesResult.rows.map((row) => row.table_name)

    return NextResponse.json({
      success: true,
      message: "Conexión a la base de datos establecida correctamente",
      timestamp: result.rows[0].now,
      duration: `${duration}ms`,
      connectionString: process.env.DATABASE_URL ? "Configurado" : "No configurado",
      postgresUrl: process.env.POSTGRES_URL ? "Configurado" : "No configurado",
      tables,
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al conectar con la base de datos",
        error: error.message,
        connectionString: process.env.DATABASE_URL ? "Configurado" : "No configurado",
        postgresUrl: process.env.POSTGRES_URL ? "Configurado" : "No configurado",
        environment: process.env.NODE_ENV || "development",
      },
      { status: 500 },
    )
  }
}
