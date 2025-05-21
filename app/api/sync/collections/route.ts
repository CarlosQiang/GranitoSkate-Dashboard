import { NextResponse } from "next/server"
import { getShopifyCollections } from "@/lib/services/shopify-service"
import * as coleccionesRepository from "@/lib/repositories/colecciones-repository"
import db from "@/lib/db/vercel-postgres"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "sync-collections-api",
})

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Obtener el límite de la URL si existe
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const syncMode = url.searchParams.get("mode") || "full"
    const shopifyId = url.searchParams.get("shopifyId")

    logger.info("Iniciando sincronización de colecciones", { limit, syncMode, shopifyId })

    // Si se proporciona un ID de Shopify, sincronizar solo esa colección
    if (shopifyId) {
      logger.info(`Sincronizando colección específica con ID ${shopifyId}`)

      const colecciones = await getShopifyCollections(true)
      const coleccion = colecciones.find((c) => c.id === shopifyId || c.id.includes(shopifyId))

      if (!coleccion) {
        logger.warn(`No se encontró la colección con ID ${shopifyId} en Shopify`)
        return NextResponse.json(
          {
            success: false,
            message: `No se encontró la colección con ID ${shopifyId} en Shopify`,
          },
          { status: 404 },
        )
      }

      logger.info(`Colección encontrada en Shopify: ${coleccion.title}`)

      try {
        const resultado = await coleccionesRepository.saveColeccionFromShopify(coleccion)

        logger.info(`Colección sincronizada correctamente: ${coleccion.title}`)

        return NextResponse.json({
          success: true,
          message: `Colección sincronizada correctamente: ${coleccion.title}`,
          data: resultado,
        })
      } catch (error) {
        logger.error(`Error al sincronizar colección ${shopifyId}`, {
          error: error instanceof Error ? error.message : "Error desconocido",
        })

        return NextResponse.json(
          {
            success: false,
            message: `Error al sincronizar colección: ${error instanceof Error ? error.message : "Error desconocido"}`,
          },
          { status: 500 },
        )
      }
    }

    // Si el modo es "cache", solo obtener colecciones y almacenarlas en caché
    if (syncMode === "cache") {
      logger.info(`Obteniendo ${limit} colecciones de Shopify para caché`)

      const collections = await getShopifyCollections(true, limit)

      logger.info(`Se obtuvieron ${collections.length} colecciones de Shopify y se almacenaron en caché`)

      return NextResponse.json({
        success: true,
        message: `Se obtuvieron ${collections.length} colecciones de Shopify y se almacenaron en caché`,
        count: collections.length,
        collections: collections.map((c) => ({
          id: c.id,
          title: c.title,
          productsCount: c.productsCount,
        })),
      })
    }

    // Sincronizar colecciones con la base de datos
    logger.info(`Sincronizando ${limit} colecciones con la base de datos`)

    const colecciones = await getShopifyCollections(true, limit)

    if (!colecciones || colecciones.length === 0) {
      logger.warn("No se encontraron colecciones en Shopify")
      return NextResponse.json({ success: false, message: "No se encontraron colecciones en Shopify" }, { status: 404 })
    }

    logger.info(`Se obtuvieron ${colecciones.length} colecciones de Shopify`)

    const resultados = []
    const errores = []

    // Sincronizar cada colección
    for (const coleccion of colecciones) {
      try {
        logger.debug(`Sincronizando colección: ${coleccion.title}`)
        const resultado = await coleccionesRepository.saveColeccionFromShopify(coleccion)
        resultados.push(resultado)
        logger.debug(`Colección sincronizada correctamente: ${coleccion.title}`)
      } catch (error) {
        logger.error(`Error al sincronizar colección ${coleccion.id}`, {
          error: error instanceof Error ? error.message : "Error desconocido",
        })
        errores.push({
          id: coleccion.id,
          title: coleccion.title,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Registrar el evento de sincronización
    await db.logSyncEvent(
      "colecciones",
      "BATCH",
      "sincronizar",
      errores.length === 0 ? "exito" : "parcial",
      `Sincronización de colecciones: ${resultados.length} exitosas, ${errores.length} fallidas`,
      { resultados: resultados.length, errores: errores.length },
    )

    logger.info(`Sincronización completada: ${resultados.length} colecciones sincronizadas, ${errores.length} errores`)

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${resultados.length} colecciones sincronizadas, ${errores.length} errores`,
      data: {
        sincronizadas: resultados.length,
        errores: errores.length,
      },
    })
  } catch (error) {
    logger.error("Error al sincronizar colecciones", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    // Registrar el error
    await db.logSyncEvent("colecciones", "BATCH", "sincronizar", "error", "Error general al sincronizar colecciones", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        success: false,
        message: "Error al sincronizar colecciones",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
