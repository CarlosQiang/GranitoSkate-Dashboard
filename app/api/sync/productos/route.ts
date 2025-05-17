import { NextResponse } from "next/server"
import { sincronizarProductos } from "@/lib/services/sync-service"

export async function POST(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)

    // Sincronizar productos reales de Shopify
    const resultados = await sincronizarProductos(limit)

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
      resultados,
    })
  } catch (error) {
    console.error("Error en la sincronización de productos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)

    // Sincronizar productos reales de Shopify
    const resultados = await sincronizarProductos(limit)

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
      resultados,
    })
  } catch (error) {
    console.error("Error en la sincronización de productos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
