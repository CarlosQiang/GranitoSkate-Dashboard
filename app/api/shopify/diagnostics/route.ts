import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { checkShopifyConnection } from "@/lib/system-check"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "No autorizado. Debe iniciar sesión para acceder a esta función.",
          details: "Se requiere autenticación para acceder a los diagnósticos de Shopify",
        },
        { status: 401 },
      )
    }

    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      const missingVars = []
      if (!shopDomain) missingVars.push("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN")
      if (!accessToken) missingVars.push("SHOPIFY_ACCESS_TOKEN")

      return NextResponse.json(
        {
          success: false,
          message: `Configuración de Shopify incompleta: faltan variables de entorno`,
          details: {
            missingVariables: missingVars,
            environment: process.env.NODE_ENV,
          },
        },
        { status: 500 },
      )
    }

    // Medir el tiempo de respuesta
    const startTime = Date.now()

    // Verificar la conexión a Shopify
    const shopifyStatus = await checkShopifyConnection()

    // Calcular la latencia
    const latency = Date.now() - startTime

    // Verificar endpoints específicos
    const endpoints = {
      graphql: { status: shopifyStatus.status },
      rest: { status: "not_tested" }, // Podríamos implementar pruebas adicionales aquí
    }

    // Preparar la respuesta
    const diagnosticResult = {
      success: shopifyStatus.status === "ok",
      message: shopifyStatus.message,
      shopInfo: {
        name: shopifyStatus.shopName,
        id: shopifyStatus.shopId,
        url: shopifyStatus.shopUrl,
        domain: shopifyStatus.domain,
      },
      apiStatus: {
        status: shopifyStatus.status,
        version: "2023-10", // Versión de la API que estamos usando
        latency,
      },
      endpoints,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }

    if (shopifyStatus.status !== "ok") {
      diagnosticResult.details = shopifyStatus.details
    }

    return NextResponse.json(diagnosticResult)
  } catch (error) {
    console.error("Error al realizar diagnósticos de Shopify:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error al realizar diagnósticos de Shopify",
        details: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
