import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { syncAllProducts } from "@/lib/services/product-sync-service"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "api-sync-products",
})

// Asegurarnos de que la ruta de API acepte solicitudes POST

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

    return NextResponse.json(result)
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

// Añadir soporte para GET para compatibilidad con versiones anteriores
export async function GET() {
  return NextResponse.json({ error: "Método no permitido. Use POST en su lugar." }, { status: 405 })
}
