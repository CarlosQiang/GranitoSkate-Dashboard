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

    // Verificar conexión a la base de datos
    const result = await sql`SELECT NOW() as time`

    // Verificar tablas existentes
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    const tableNames = tables.rows.map((row) => row.table_name)

    // Verificar si existen las tablas principales
    const requiredTables = [
      "administradores",
      "productos",
      "variantes_producto",
      "imagenes_producto",
      "colecciones",
      "productos_colecciones",
      "promociones",
      "mercados",
      "clientes",
      "direcciones_cliente",
      "pedidos",
      "lineas_pedido",
      "transacciones",
      "envios",
      "metadatos",
      "registro_sincronizacion",
    ]

    const missingTables = requiredTables.filter((table) => !tableNames.includes(table))

    return NextResponse.json({
      success: true,
      time: result.rows[0].time,
      tables: tableNames,
      missingTables,
      databaseReady: missingTables.length === 0,
    })
  } catch (error) {
    console.error("Error al verificar la base de datos:", error)
    return NextResponse.json(
      { error: "Error al verificar la base de datos", details: (error as Error).message },
      { status: 500 },
    )
  }
}
