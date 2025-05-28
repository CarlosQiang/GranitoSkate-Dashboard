import { type NextRequest, NextResponse } from "next/server"
import { ServicioColeccion } from "@/lib/servicios/coleccion.servicio"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const emailUsuario = searchParams.get("emailUsuario")
    const pagina = Number(searchParams.get("pagina") || "1")
    const limite = Number(searchParams.get("limite") || "10")

    if (!emailUsuario) {
      return NextResponse.json({ error: "Email de usuario requerido" }, { status: 400 })
    }

    const resultado = await ServicioColeccion.listarPorUsuario(emailUsuario, pagina, limite)
    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Error en GET /api/db/colecciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json()

    if (!datos.email_usuario) {
      return NextResponse.json({ error: "Email de usuario requerido" }, { status: 400 })
    }

    const coleccion = await ServicioColeccion.crear(datos)
    return NextResponse.json(coleccion, { status: 201 })
  } catch (error) {
    console.error("Error en POST /api/db/colecciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
