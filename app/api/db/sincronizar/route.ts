import { type NextRequest, NextResponse } from "next/server"
import { ServicioProducto } from "@/lib/servicios/producto.servicio"
import { ServicioColeccion } from "@/lib/servicios/coleccion.servicio"

export async function POST(request: NextRequest) {
  try {
    const { emailUsuario, tipo, datos } = await request.json()

    if (!emailUsuario || !tipo || !datos) {
      return NextResponse.json({ error: "Parámetros requeridos: emailUsuario, tipo, datos" }, { status: 400 })
    }

    let resultado
    switch (tipo) {
      case "producto":
        resultado = await ServicioProducto.sincronizarConShopify(emailUsuario, datos)
        break
      case "coleccion":
        resultado = await ServicioColeccion.sincronizarConShopify(emailUsuario, datos)
        break
      default:
        return NextResponse.json({ error: "Tipo no válido" }, { status: 400 })
    }

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Error en POST /api/db/sincronizar:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
