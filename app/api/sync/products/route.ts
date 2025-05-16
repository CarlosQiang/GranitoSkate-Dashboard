import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { syncAllProducts } from "@/lib/services/product-sync-service"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "api-sync-products",
})

// Permitir solicitudes GET para compatibilidad con el componente AutoSyncProducts
export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      logger.warn("Intento de acceso no autorizado a la API de sincronización de productos")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Iniciar sincronización con límite predeterminado
    logger.info("Iniciando sincronización de productos mediante GET")
    const result = await syncAllProducts(250)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    logger.error("Error en la sincronización de productos", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        error: "Error en la sincronización de productos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// Mantener soporte para POST para futuras implementaciones
export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      logger.warn("Intento de acceso no autorizado a la API de sincronización de productos")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la solicitud
    const body = await request.json().catch(() => ({}))
    const limit = body.limit || 250

    // Iniciar sincronización
    logger.info("Iniciando sincronización de productos", { limit })
    const result = await syncAllProducts(limit)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    logger.error("Error en la sincronización de productos", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        error: "Error en la sincronización de productos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
