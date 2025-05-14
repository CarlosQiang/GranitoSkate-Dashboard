import { NextResponse } from "next/server"
import db from "@/lib/db/vercel-postgres"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo")
    const resultado = searchParams.get("resultado")
    const desde = searchParams.get("desde")
    const hasta = searchParams.get("hasta")

    let query = "SELECT * FROM registro_sincronizacion WHERE 1=1"
    const params: any[] = []

    if (tipo) {
      params.push(tipo)
      query += ` AND tipo_entidad = $${params.length}`
    }

    if (resultado) {
      params.push(resultado)
      query += ` AND resultado = $${params.length}`
    }

    if (desde) {
      params.push(desde)
      query += ` AND fecha >= $${params.length}`
    }

    if (hasta) {
      params.push(hasta)
      query += ` AND fecha <= $${params.length}`
    }

    query += " ORDER BY fecha DESC LIMIT 100"

    const registros = await db.executeQuery(query, params)
    return NextResponse.json(registros)
  } catch (error) {
    console.error("Error al obtener registros de sincronización:", error)
    return NextResponse.json({ error: "Error al obtener registros de sincronización" }, { status: 500 })
  }
}
