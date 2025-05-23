import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as productosRepository from "@/lib/repositories/productos-repository"
import { logSyncEvent } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const productos = await productosRepository.getAllProductos()
    return NextResponse.json(productos)
  } catch (error: any) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    // Validar datos
    if (!data.titulo) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 })
    }

    // Crear producto
    const producto = await productosRepository.createProducto(data)

    // Registrar evento
    await logSyncEvent("PRODUCT", producto.id.toString(), "CREATE", "SUCCESS", `Producto creado: ${data.titulo}`)

    return NextResponse.json(producto, { status: 201 })
  } catch (error: any) {
    console.error("Error al crear producto:", error)

    // Registrar error
    await logSyncEvent("PRODUCT", "UNKNOWN", "CREATE", "ERROR", `Error al crear producto: ${error.message}`)

    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
