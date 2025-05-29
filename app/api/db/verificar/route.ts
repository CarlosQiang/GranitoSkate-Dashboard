import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const result = await query("SELECT NOW() as time")

    // Verificar tablas
    const tablas = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

    const tablasExistentes = tablas.rows.map((row: any) => row.table_name)

    // Verificar si existen las tablas principales
    const tablasRequeridas = ["productos", "colecciones", "pedidos", "registros_actividad", "administradores"]

    const tablasPresentes = tablasRequeridas.filter((tabla) => tablasExistentes.includes(tabla))
    const tablasFaltantes = tablasRequeridas.filter((tabla) => !tablasExistentes.includes(tabla))

    return NextResponse.json({
      success: true,
      conexion: "OK",
      timestamp: result.rows[0].time,
      tablas: {
        total: tablasExistentes.length,
        existentes: tablasExistentes,
        requeridas: {
          presentes: tablasPresentes,
          faltantes: tablasFaltantes,
        },
      },
    })
  } catch (error) {
    console.error("Error al verificar la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        conexion: "ERROR",
      },
      { status: 500 },
    )
  }
}
