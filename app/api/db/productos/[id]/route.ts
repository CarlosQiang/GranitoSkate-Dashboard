import { type NextRequest, NextResponse } from "next/server"
import { ServicioProducto } from "@/lib/servicios/producto.servicio"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const producto = await ServicioProducto.obtenerPorId(params.id)

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(producto)
  } catch (error) {
    console.error("Error en GET /api/db/productos/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const datos = await request.json()
    const producto = await ServicioProducto.actualizar(params.id, datos)

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(producto)
  } catch (error) {
    console.error("Error en PUT /api/db/productos/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const emailUsuario = searchParams.get("emailUsuario")

    if (!emailUsuario) {
      return NextResponse.json({ error: "Email de usuario requerido" }, { status: 400 })
    }

    const eliminado = await ServicioProducto.eliminar(params.id, emailUsuario)

    if (!eliminado) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ mensaje: "Producto eliminado correctamente" })
  } catch (error) {
    console.error("Error en DELETE /api/db/productos/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
