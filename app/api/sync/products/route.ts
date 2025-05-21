import { NextResponse } from "next/server"
import { obtenerProductosPorShopify } from "@/lib/services/shopify-service"
import productosRepository from "@/lib/repositories/productos-repository"
import db from "@/lib/db/vercel-postgres"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shopifyId = searchParams.get("shopifyId")

    // Si se proporciona un ID de Shopify, sincronizar solo ese producto
    if (shopifyId) {
      const productos = await obtenerProductosPorShopify()
      const producto = productos.find((p) => p.id === shopifyId)

      if (!producto) {
        return NextResponse.json(
          {
            success: false,
            message: `No se encontró el producto con ID ${shopifyId} en Shopify`,
          },
          { status: 404 },
        )
      }

      const resultado = await productosRepository.sincronizarProducto(producto)

      return NextResponse.json({
        success: true,
        message: `Producto sincronizado correctamente: ${producto.title}`,
        data: resultado,
      })
    }

    // Si no se proporciona ID, sincronizar todos los productos
    const productos = await obtenerProductosPorShopify()

    if (!productos || productos.length === 0) {
      return NextResponse.json({ success: false, message: "No se encontraron productos en Shopify" }, { status: 404 })
    }

    const resultados = []
    const errores = []

    // Sincronizar cada producto
    for (const producto of productos) {
      try {
        const resultado = await productosRepository.sincronizarProducto(producto)
        resultados.push(resultado)
      } catch (error) {
        console.error(`Error al sincronizar producto ${producto.id}:`, error)
        errores.push({
          id: producto.id,
          title: producto.title,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Registrar el evento de sincronización
    await db.logSyncEvent(
      "productos",
      "BATCH",
      "sincronizar",
      errores.length === 0 ? "exito" : "parcial",
      `Sincronización de productos: ${resultados.length} exitosos, ${errores.length} fallidos`,
      { resultados, errores },
    )

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${resultados.length} productos sincronizados, ${errores.length} errores`,
      data: {
        sincronizados: resultados,
        errores: errores,
      },
    })
  } catch (error) {
    console.error("Error al sincronizar productos:", error)

    // Registrar el error
    await db.logSyncEvent("productos", "BATCH", "sincronizar", "error", "Error general al sincronizar productos", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        success: false,
        message: "Error al sincronizar productos",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
