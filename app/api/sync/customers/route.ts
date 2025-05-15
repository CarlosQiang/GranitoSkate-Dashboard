import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { syncAllCustomers } from "@/lib/services/customer-sync-service"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "api-sync-customers",
})

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      logger.warn("Intento de acceso no autorizado a la API de sincronización de clientes")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la solicitud (opcional)
    const body = await request.json().catch(() => ({}))
    const limit = body.limit || 250

    // Iniciar sincronización
    logger.info("Iniciando sincronización de clientes", { limit })
    const result = await syncAllCustomers(limit)

    return NextResponse.json(result)
  } catch (error) {
    logger.error("Error en la sincronización de clientes", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        error: "Error en la sincronización de clientes",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
