import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as productosRepository from "@/lib/db/repositories/productos-repository"
import * as registroRepository from "@/lib/db/repositories/registro-repository"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const productos = await productosRepository.getAllProductos()
    return NextResponse.json(productos)
  } catch (error) {
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
    await registroRepository.logSyncEvent({
      tipo_entidad: "PRODUCT",
      entidad_id: producto[0].id.toString(),
      accion: "CREATE",
      resultado: "SUCCESS",
      mensaje: `Producto creado: ${data.titulo}`,
    })

    return NextResponse.json(producto[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear producto:", error)

    // Registrar error
    await registroRepository.logSyncEvent({
      tipo_entidad: "PRODUCT",
      accion: "CREATE",
      resultado: "ERROR",
      mensaje: `Error al crear producto: ${(error as Error).message}`,
    })

    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
