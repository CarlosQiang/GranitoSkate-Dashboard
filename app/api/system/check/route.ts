import { NextResponse } from "next/server"
import config from "@/lib/config"
import { testShopifyConnection } from "@/lib/shopify"
import { checkDatabaseConnection } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Verificar configuración
    const configCheck = {
      shopify: {
        apiUrl: config.shopify.apiUrl ? "Configurado" : "No configurado",
        accessToken: config.shopify.accessToken ? "Configurado" : "No configurado",
        shopDomain: config.shopify.shopDomain ? "Configurado" : "No configurado",
      },
      database: {
        url: config.database.url ? "Configurado" : "No configurado",
      },
      auth: {
        secret: config.auth.secret ? "Configurado" : "No configurado",
        url: config.auth.url ? "Configurado" : "No configurado",
      },
      app: {
        url: config.app.url,
        isDevelopment: config.app.isDevelopment,
      },
    }

    // Verificar conexión con Shopify
    const shopifyConnection = await testShopifyConnection(true).catch((err) => ({
      success: false,
      message: `Error al conectar con Shopify: ${err.message}`,
    }))

    // Verificar conexión con la base de datos
    const dbConnection = await checkDatabaseConnection()

    return NextResponse.json({
      success: shopifyConnection.success && dbConnection.connected,
      config: configCheck,
      shopifyConnection,
      dbConnection,
    })
  } catch (error) {
    console.error("Error al verificar la configuración del sistema:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al verificar la configuración del sistema",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
