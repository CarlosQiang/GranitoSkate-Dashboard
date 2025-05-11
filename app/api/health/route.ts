import { NextResponse } from "next/server"
import { testShopifyConnection } from "@/lib/shopify"

export async function GET() {
  try {
    // Verificar la conexión con Shopify
    const shopifyStatus = await testShopifyConnection()

    // Verificar que las variables de entorno estén definidas
    const envVars = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "defined" : "undefined",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "defined" : "undefined",
      SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN ? "defined" : "undefined",
      NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN ? "defined" : "undefined",
    }

    // Verificar si todas las variables de entorno están definidas
    const allEnvVarsDefined = Object.values(envVars).every((status) => status === "defined")

    return NextResponse.json({
      success: true,
      message: "API funcionando correctamente",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      shopify: {
        connected: shopifyStatus.success,
        message: shopifyStatus.message,
      },
      environmentVariables: {
        status: allEnvVarsDefined ? "complete" : "incomplete",
        details: envVars,
      },
    })
  } catch (error) {
    console.error("Error en el endpoint de salud:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error en el endpoint de salud: ${error instanceof Error ? error.message : "Error desconocido"}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
