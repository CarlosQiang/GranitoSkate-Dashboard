import { NextResponse } from "next/server"
import productosRepository from "@/lib/repositories/productos-repository"
import db from "@/lib/db/vercel-postgres"

export async function GET() {
  try {
    const productos = await productosRepository.getAllProductos()
    return NextResponse.json({
      success: true,
      message: "Productos obtenidos correctamente",
      data: productos,
    })
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener productos",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validar datos mínimos
    if (!data.shopify_id || !data.titulo) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos incompletos. Se requiere shopify_id y titulo",
        },
        { status: 400 },
      )
    }

    const producto = await productosRepository.createProducto(data)

    // Registrar evento de creación
    await db.logSyncEvent(
      "productos",
      data.shopify_id,
      "crear",
      "exito",
      `Producto creado manualmente: ${data.titulo}`,
      { producto },
    )

    return NextResponse.json({
      success: true,
      message: "Producto creado correctamente",
      data: producto,
    })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al crear producto",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
