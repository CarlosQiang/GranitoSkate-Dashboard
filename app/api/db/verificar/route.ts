import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    await query("SELECT 1")

    // Verificar que las tablas principales existen
    const tablas = ["usuarios", "productos", "colecciones", "clientes", "pedidos", "promociones"]
    const verificaciones = []

    for (const tabla of tablas) {
      try {
        const resultado = await query(
          `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          ) as existe
        `,
          [tabla],
        )

        verificaciones.push({
          tabla,
          existe: resultado.rows[0].existe,
          estado: resultado.rows[0].existe ? "OK" : "FALTA",
        })
      } catch (error) {
        verificaciones.push({
          tabla,
          existe: false,
          estado: "ERROR",
          error: error.message,
        })
      }
    }

    // Contar registros en cada tabla
    const estadisticas = {}
    for (const verificacion of verificaciones) {
      if (verificacion.existe) {
        try {
          const resultado = await query(`SELECT COUNT(*) as total FROM ${verificacion.tabla}`)
          estadisticas[verificacion.tabla] = Number.parseInt(resultado.rows[0].total)
        } catch (error) {
          estadisticas[verificacion.tabla] = "Error al contar"
        }
      }
    }

    return NextResponse.json({
      estado: "OK",
      mensaje: "Base de datos verificada correctamente",
      verificaciones,
      estadisticas,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error verificando base de datos:", error)
    return NextResponse.json(
      {
        estado: "ERROR",
        mensaje: "Error al verificar la base de datos",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
