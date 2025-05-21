import { NextResponse } from "next/server"
import * as productosRepository from "@/lib/repositories/productos-repository"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "api-db-productos-id",
})

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID de producto inválido",
        },
        { status: 400 },
      )
    }

    logger.debug(`Obteniendo producto con ID ${id}`)

    const producto = await productosRepository.getProductById(id)

    if (!producto) {
      logger.warn(`Producto con ID ${id} no encontrado`)
      return NextResponse.json(
        {
          success: false,
          message: "Producto no encontrado",
        },
        { status: 404 },
      )
    }

    logger.debug(`Producto encontrado: ${producto.titulo}`)

    return NextResponse.json({
      success: true,
      data: producto,
    })
  } catch (error) {
    logger.error(`Error al obtener producto con ID ${params.id}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener producto",
        error: error instanceof Error ? error.message : "Error desconocido",
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
          message: "ID de producto inválido",
        },
        { status: 400 },
      )
    }

    logger.debug(`Actualizando producto con ID ${id}`)

    // Verificar si el producto existe
    const existingProduct = await productosRepository.getProductById(id)

    if (!existingProduct) {
      logger.warn(`Producto con ID ${id} no encontrado para actualizar`)
      return NextResponse.json(
        {
          success: false,
          message: "Producto no encontrado",
        },
        { status: 404 },
      )
    }

    const data = await request.json()

    // Actualizar el producto
    const updatedProduct = await productosRepository.updateProduct(id, {
      ...data,
      fecha_actualizacion: new Date(),
    })

    logger.info(`Producto actualizado: ${updatedProduct.id}`)

    return NextResponse.json({
      success: true,
      message: "Producto actualizado correctamente",
      data: updatedProduct,
    })
  } catch (error) {
    logger.error(`Error al actualizar producto con ID ${params.id}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        success: false,
        message: "Error al actualizar producto",
        error: error instanceof Error ? error.message : "Error desconocido",
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
          message: "ID de producto inválido",
        },
        { status: 400 },
      )
    }

    logger.debug(`Eliminando producto con ID ${id}`)

    // Verificar si el producto existe
    const existingProduct = await productosRepository.getProductById(id)

    if (!existingProduct) {
      logger.warn(`Producto con ID ${id} no encontrado para eliminar`)
      return NextResponse.json(
        {
          success: false,
          message: "Producto no encontrado",
        },
        { status: 404 },
      )
    }

    // Eliminar el producto
    await productosRepository.deleteProduct(id)

    logger.info(`Producto eliminado: ${id}`)

    return NextResponse.json({
      success: true,
      message: "Producto eliminado correctamente",
    })
  } catch (error) {
    logger.error(`Error al eliminar producto con ID ${params.id}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        success: false,
        message: "Error al eliminar producto",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
