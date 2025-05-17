import { NextResponse } from "next/server"
import { sincronizarProductos } from "@/lib/services/sync-service"

export async function GET(request: Request) {
  try {
    console.log("Iniciando sincronización de productos...")

    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)

    console.log(`Límite de productos a sincronizar: ${limit}`)

    // Sincronizar productos reales de Shopify
    const resultados = await sincronizarProductos(limit)

    console.log("Sincronización completada con éxito:", resultados)

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
      resultados,
    })
  } catch (error) {
    console.error("Error en la sincronización de productos:", error)

    // Devolver una respuesta más detallada para ayudar en la depuración
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
