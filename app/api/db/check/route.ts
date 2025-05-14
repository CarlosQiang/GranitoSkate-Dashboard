import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar si hay datos en las tablas principales
    const tablas = ["productos", "colecciones", "clientes", "pedidos", "promociones"]
    const resultados = {}
    let isEmpty = true

    for (const tabla of tablas) {
      try {
        const result = await sql`SELECT COUNT(*) as total FROM ${sql(tabla)}`
        const total = Number.parseInt(result.rows[0].total)
        resultados[tabla] = total

        if (total > 0) {
          isEmpty = false
        }
      } catch (error) {
        console.error(`Error al verificar tabla ${tabla}:`, error)
        resultados[tabla] = -1 // Indica error
      }
    }

    return NextResponse.json({
      success: true,
      isEmpty,
      resultados,
    })
  } catch (error) {
    console.error("Error al verificar la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error al verificar la base de datos: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}
