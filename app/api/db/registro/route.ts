import { NextResponse } from "next/server"
import {
  getAllRegistros,
  getRegistrosByTipoEntidad,
  getRegistrosByResultado,
  getRegistrosByAccion,
  getRegistrosCount,
} from "@/lib/db/repositories/registro-repository"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipoEntidad = searchParams.get("tipoEntidad")
    const resultado = searchParams.get("resultado")
    const accion = searchParams.get("accion")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let registros

    if (tipoEntidad) {
      registros = await getRegistrosByTipoEntidad(tipoEntidad, limit, offset)
    } else if (resultado) {
      registros = await getRegistrosByResultado(resultado, limit, offset)
    } else if (accion) {
      registros = await getRegistrosByAccion(accion, limit, offset)
    } else {
      registros = await getAllRegistros(limit, offset)
    }

    const total = await getRegistrosCount()

    return NextResponse.json({
      registros,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener registros:", error)
    return NextResponse.json({ error: "Error al obtener registros" }, { status: 500 })
  }
}
