import { NextResponse } from "next/server"
import * as productosRepository from "@/lib/repositories/productos-repository"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "api-db-productos",
})

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    logger.debug("Obteniendo productos de la base de datos")

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    // Obtener todos los productos
    const productos = await productosRepository.getAllProducts()

    // Aplicar filtros si es necesario
    let filteredProducts = [...productos]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.titulo?.toLowerCase().includes(searchLower) ||
          p.descripcion?.toLowerCase().includes(searchLower) ||
          p.tipo_producto?.toLowerCase().includes(searchLower) ||
          p.proveedor?.toLowerCase().includes(searchLower),
      )
    }

    if (status) {
      filteredProducts = filteredProducts.filter((p) => p.estado?.toLowerCase() === status.toLowerCase())
    }

    // Aplicar paginación
    const paginatedProducts = filteredProducts.slice(offset, offset + limit)

    logger.debug(`Se encontraron ${filteredProducts.length} productos, devolviendo ${paginatedProducts.length}`)

    return NextResponse.json({
      success: true,
      total: filteredProducts.length,
      limit,
      offset,
      data: paginatedProducts,
    })
  } catch (error) {
    logger.error("Error al obtener productos", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener productos",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    logger.debug("Creando nuevo producto")

    const data = await request.json()

    // Validar datos mínimos
    if (!data.titulo) {
      return NextResponse.json(
        {
          success: false,
          message: "El título del producto es obligatorio",
        },
        { status: 400 },
      )
    }

    // Crear el producto
    const producto = await productosRepository.updateProduct(0, {
      ...data,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    })

    logger.info(`Producto creado: ${producto.id}`)

    return NextResponse.json({
      success: true,
      message: "Producto creado correctamente",
      data: producto,
    })
  } catch (error) {
    logger.error("Error al crear producto", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        success: false,
        message: "Error al crear producto",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
