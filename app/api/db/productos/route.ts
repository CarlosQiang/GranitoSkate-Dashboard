import { type NextRequest, NextResponse } from "next/server"
import { ServicioProducto } from "@/lib/servicios/producto.servicio"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const emailUsuario = searchParams.get("emailUsuario")
    const busqueda = searchParams.get("busqueda")
    const pagina = Number(searchParams.get("pagina") || "1")
    const limite = Number(searchParams.get("limite") || "10")

    if (!emailUsuario) {
      return NextResponse.json({ error: "Email de usuario requerido" }, { status: 400 })
    }

    let resultado
    if (busqueda) {
      resultado = await ServicioProducto.buscar(emailUsuario, busqueda, pagina, limite)
    } else {
      resultado = await ServicioProducto.listarPorUsuario(emailUsuario, pagina, limite)
    }

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Error en GET /api/db/productos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json()

    if (!datos.email_usuario) {
      return NextResponse.json({ error: "Email de usuario requerido" }, { status: 400 })
    }

    const producto = await ServicioProducto.crear(datos)
    return NextResponse.json(producto, { status: 201 })
  } catch (error) {
    console.error("Error en POST /api/db/productos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
