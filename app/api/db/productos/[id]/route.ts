import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as productosRepository from "@/lib/repositories/productos-repository"
import { logSyncEvent } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const producto = await productosRepository.getProductoById(id)
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(producto)
  } catch (error: any) {
    console.error(`Error al obtener producto ${params.id}:`, error)
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

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const data = await request.json()

    // Validar datos
    if (!data.titulo) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 })
    }

    // Verificar si el producto existe
    const existingProducto = await productosRepository.getProductoById(id)
    if (!existingProducto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Actualizar producto
    const producto = await productosRepository.updateProducto(id, data)

    // Registrar evento
    await logSyncEvent("PRODUCT", id.toString(), "UPDATE", "SUCCESS", `Producto actualizado: ${data.titulo}`)

    return NextResponse.json(producto)
  } catch (error: any) {
    console.error(`Error al actualizar producto ${params.id}:`, error)

    // Registrar error
    await logSyncEvent("PRODUCT", params.id, "UPDATE", "ERROR", `Error al actualizar producto: ${error.message}`)

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

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Verificar si el producto existe
    const existingProducto = await productosRepository.getProductoById(id)
    if (!existingProducto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Eliminar producto
    await productosRepository.deleteProducto(id)

    // Registrar evento
    await logSyncEvent("PRODUCT", id.toString(), "DELETE", "SUCCESS", `Producto eliminado: ${existingProducto.titulo}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Error al eliminar producto ${params.id}:`, error)

    // Registrar error
    await logSyncEvent("PRODUCT", params.id, "DELETE", "ERROR", `Error al eliminar producto: ${error.message}`)

    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}
