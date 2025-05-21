import { NextResponse } from "next/server"
import { getShopifyProducts } from "@/lib/services/shopify-service"
import * as productosRepository from "@/lib/repositories/productos-repository"
import db from "@/lib/db/vercel-postgres"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "sync-products-api",
})

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Obtener el límite de la URL si existe
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "100")
    const syncMode = url.searchParams.get("mode") || "full"
    const shopifyId = url.searchParams.get("shopifyId")

    logger.info("Iniciando sincronización de productos", { limit, syncMode, shopifyId })

    // Si se proporciona un ID de Shopify, sincronizar solo ese producto
    if (shopifyId) {
      logger.info(`Sincronizando producto específico con ID ${shopifyId}`)

      const productos = await getShopifyProducts(true)
      const producto = productos.find((p) => p.id === shopifyId || p.id.includes(shopifyId))

      if (!producto) {
        logger.warn(`No se encontró el producto con ID ${shopifyId} en Shopify`)
        return NextResponse.json(
          {
            success: false,
            message: `No se encontró el producto con ID ${shopifyId} en Shopify`,
          },
          { status: 404 },
        )
      }

      logger.info(`Producto encontrado en Shopify: ${producto.title}`)

      try {
        const resultado = await productosRepository.saveProductFromShopify(producto)

        logger.info(`Producto sincronizado correctamente: ${producto.title}`)

        return NextResponse.json({
          success: true,
          message: `Producto sincronizado correctamente: ${producto.title}`,
          data: resultado,
        })
      } catch (error) {
        logger.error(`Error al sincronizar producto ${shopifyId}`, {
          error: error instanceof Error ? error.message : "Error desconocido",
        })

        return NextResponse.json(
          {
            success: false,
            message: `Error al sincronizar producto: ${error instanceof Error ? error.message : "Error desconocido"}`,
          },
          { status: 500 },
        )
      }
    }

    // Si el modo es "cache", solo obtener productos y almacenarlos en caché
    if (syncMode === "cache") {
      logger.info(`Obteniendo ${limit} productos de Shopify para caché`)

      const products = await getShopifyProducts(true, limit)

      logger.info(`Se obtuvieron ${products.length} productos de Shopify y se almacenaron en caché`)

      return NextResponse.json({
        success: true,
        message: `Se obtuvieron ${products.length} productos de Shopify y se almacenaron en caché`,
        count: products.length,
        products: products.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          variants: p.variants.edges.length,
        })),
      })
    }

    // Sincronizar productos con la base de datos
    logger.info(`Sincronizando ${limit} productos con la base de datos`)

    const productos = await getShopifyProducts(true, limit)

    if (!productos || productos.length === 0) {
      logger.warn("No se encontraron productos en Shopify")
      return NextResponse.json({ success: false, message: "No se encontraron productos en Shopify" }, { status: 404 })
    }

    logger.info(`Se obtuvieron ${productos.length} productos de Shopify`)

    const resultados = []
    const errores = []

    // Sincronizar cada producto
    for (const producto of productos) {
      try {
        logger.debug(`Sincronizando producto: ${producto.title}`)
        const resultado = await productosRepository.saveProductFromShopify(producto)
        resultados.push(resultado)
        logger.debug(`Producto sincronizado correctamente: ${producto.title}`)
      } catch (error) {
        logger.error(`Error al sincronizar producto ${producto.id}`, {
          error: error instanceof Error ? error.message : "Error desconocido",
        })
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
      { resultados: resultados.length, errores: errores.length },
    )

    logger.info(`Sincronización completada: ${resultados.length} productos sincronizados, ${errores.length} errores`)

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${resultados.length} productos sincronizados, ${errores.length} errores`,
      data: {
        sincronizados: resultados.length,
        errores: errores.length,
      },
    })
  } catch (error) {
    logger.error("Error al sincronizar productos", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

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

export async function POST(request: Request) {
  return GET(request)
}
