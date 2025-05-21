import { NextResponse } from "next/server"
import productosRepository from "@/lib/repositories/productos-repository"
import db from "@/lib/db/vercel-postgres"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID inválido",
        },
        { status: 400 },
      )
    }

    const producto = await productosRepository.getProductoById(id)

    if (!producto) {
      return NextResponse.json(
        {
          success: false,
          message: `Producto con ID ${id} no encontrado`,
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Producto obtenido correctamente",
      data: producto,
    })
  } catch (error) {
    console.error(`Error al obtener producto con ID ${params.id}:`, error)
    return NextResponse.json(
      {
        success: false,
        message: `Error al obtener producto con ID ${params.id}`,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID inválido",
        },
        { status: 400 },
      )
    }

    // Verificar si el producto existe
    const productoExistente = await productosRepository.getProductoById(id)

    if (!productoExistente) {
      return NextResponse.json(
        {
          success: false,
          message: `Producto con ID ${id} no encontrado`,
        },
        { status: 404 },
      )
    }

    const data = await request.json()
    const productoActualizado = await productosRepository.updateProducto(id, data)

    // Registrar evento de actualización
    await db.logSyncEvent(
      "productos",
      productoExistente.shopify_id,
      "actualizar",
      "exito",
      `Producto actualizado manualmente: ${productoActualizado.titulo}`,
      { producto: productoActualizado },
    )

    return NextResponse.json({
      success: true,
      message: "Producto actualizado correctamente",
      data: productoActualizado,
    })
  } catch (error) {
    console.error(`Error al actualizar producto con ID ${params.id}:`, error)
    return NextResponse.json(
      {
        success: false,
        message: `Error al actualizar producto con ID ${params.id}`,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID inválido",
        },
        { status: 400 },
      )
    }

    // Verificar si el producto existe
    const productoExistente = await productosRepository.getProductoById(id)

    if (!productoExistente) {
      return NextResponse.json(
        {
          success: false,
          message: `Producto con ID ${id} no encontrado`,
        },
        { status: 404 },
      )
    }

    await productosRepository.deleteProducto(id)

    // Registrar evento de eliminación
    await db.logSyncEvent(
      "productos",
      productoExistente.shopify_id,
      "eliminar",
      "exito",
      `Producto eliminado manualmente: ${productoExistente.titulo}`,
      { producto: productoExistente },
    )

    return NextResponse.json({
      success: true,
      message: "Producto eliminado correctamente",
    })
  } catch (error) {
    console.error(`Error al eliminar producto con ID ${params.id}:`, error)
    return NextResponse.json(
      {
        success: false,
        message: `Error al eliminar producto con ID ${params.id}`,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
