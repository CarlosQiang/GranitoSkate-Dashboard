import { NextResponse } from "next/server"
import { shopifyConfig, isShopifyConfigValid, getShopifyConfigErrors } from "@/lib/config/shopify"
import { testShopifyConnection } from "@/lib/shopify"

export async function GET() {
  try {
    const configValid = isShopifyConfigValid()
    const configErrors = getShopifyConfigErrors()

    // Intentar una conexión de prueba
    const connectionTest = await testShopifyConnection(true)

    return NextResponse.json({
      success: configValid && connectionTest.success,
      configValid,
      configErrors,
      connectionTest,
      config: {
        apiUrl: shopifyConfig.apiUrl ? "Configurado" : "No configurado",
        accessToken: shopifyConfig.accessToken ? "Configurado" : "No configurado",
        shopDomain: shopifyConfig.shopDomain ? "Configurado" : "No configurado",
      },
    })
  } catch (error) {
    console.error("Error al verificar la configuración de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        config: {
          apiUrl: shopifyConfig.apiUrl ? "Configurado" : "No configurado",
          accessToken: shopifyConfig.accessToken ? "Configurado" : "No configurado",
          shopDomain: shopifyConfig.shopDomain ? "Configurado" : "No configurado",
        },
      },
      { status: 500 },
    )
  }
}
