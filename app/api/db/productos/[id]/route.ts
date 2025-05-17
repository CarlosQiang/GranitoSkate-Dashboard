import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as productosRepository from "@/lib/db/repositories/productos-repository"
import { logSyncEvent } from "@/lib/db/repositories/registro-repository"
import { getProductoCompleto } from "@/lib/db/repositories/productos-repository"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 })
    }

    const producto = await getProductoCompleto(id)

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(producto)
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id, 10)
    const data = await request.json()

    // Validar datos
    if (!data.titulo) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 })
    }

    // Verificar que el producto existe
    const producto = await productosRepository.getProductoById(id)
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Actualizar producto
    const productoActualizado = await productosRepository.updateProducto(id, data)

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "PRODUCT",
      entidad_id: id.toString(),
      accion: "UPDATE",
      resultado: "SUCCESS",
      mensaje: `Producto actualizado: ${data.titulo}`,
    })

    return NextResponse.json(productoActualizado)
  } catch (error) {
    console.error(`Error al actualizar producto ${params.id}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "PRODUCT",
      entidad_id: params.id,
      accion: "UPDATE",
      resultado: "ERROR",
      mensaje: `Error al actualizar producto: ${(error as Error).message}`,
    })

    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id, 10)

    // Verificar que el producto existe
    const producto = await productosRepository.getProductoById(id)
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Eliminar producto
    await productosRepository.deleteProducto(id)

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "PRODUCT",
      entidad_id: id.toString(),
      accion: "DELETE",
      resultado: "SUCCESS",
      mensaje: `Producto eliminado: ${producto.titulo}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error al eliminar producto ${params.id}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "PRODUCT",
      entidad_id: params.id,
      accion: "DELETE",
      resultado: "ERROR",
      mensaje: `Error al eliminar producto: ${(error as Error).message}`,
    })

    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}
