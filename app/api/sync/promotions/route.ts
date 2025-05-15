import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { syncAllPromotions } from "@/lib/services/promotion-sync-service"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "api-sync-promotions",
})

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      logger.warn("Intento de acceso no autorizado a la API de sincronización de promociones")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Iniciar sincronización
    logger.info("Iniciando sincronización de promociones")
    const result = await syncAllPromotions()

    return NextResponse.json(result)
  } catch (error) {
    logger.error("Error en la sincronización de promociones", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        error: "Error en la sincronización de promociones",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
