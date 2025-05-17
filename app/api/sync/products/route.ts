import { NextResponse } from "next/server"
import { sincronizarProductos } from "@/lib/services/sync-service"

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

    console.log(`Iniciando sincronización de productos (límite: ${limit})...`)

    // Verificar que las variables de entorno estén configuradas
    if (!process.env.SHOPIFY_API_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "Variables de entorno de Shopify no configuradas",
          env: {
            SHOPIFY_API_URL: process.env.SHOPIFY_API_URL ? "Configurado" : "No configurado",
            SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN ? "Configurado" : "No configurado",
          },
        },
        { status: 500 },
      )
    }

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

export async function POST(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

    console.log(`Iniciando sincronización de productos (límite: ${limit})...`)

    // Verificar que las variables de entorno estén configuradas
    if (!process.env.SHOPIFY_API_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "Variables de entorno de Shopify no configuradas",
          env: {
            SHOPIFY_API_URL: process.env.SHOPIFY_API_URL ? "Configurado" : "No configurado",
            SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN ? "Configurado" : "No configurado",
          },
        },
        { status: 500 },
      )
    }

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
