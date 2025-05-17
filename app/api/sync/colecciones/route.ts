import { NextResponse } from "next/server"
import { obtenerColeccionesDeShopify } from "@/lib/services/sync-service"

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)

    // Obtener colecciones reales de Shopify
    const colecciones = await obtenerColeccionesDeShopify(limit)

    return NextResponse.json({
      success: true,
      message: `Se obtuvieron ${colecciones.length} colecciones de Shopify`,
      data: colecciones,
    })
  } catch (error) {
    console.error("Error al obtener colecciones:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}
