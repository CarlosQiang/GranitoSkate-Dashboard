import { NextResponse } from "next/server"
import { envConfig, getConfigErrors, isConfigValid } from "@/lib/config/env"
import { testShopifyConnection } from "@/lib/shopify"
import { PrismaClient } from "@prisma/client"

export async function GET() {
  try {
    const errors = getConfigErrors()
    const isValid = isConfigValid()

    // Verificar conexión con Shopify
    const shopifyConnection = await testShopifyConnection(true).catch((err) => ({
      success: false,
      message: `Error al conectar con Shopify: ${err.message}`,
    }))

    // Verificar conexión con la base de datos
    let dbConnection = { success: false, message: "No se pudo verificar la conexión con la base de datos" }

    try {
      const prisma = new PrismaClient()
      await prisma.$connect()

      // Intentar una consulta simple
      const result = await prisma.$queryRaw`SELECT 1 as test`

      dbConnection = {
        success: true,
        message: "Conexión exitosa con la base de datos",
      }

      await prisma.$disconnect()
    } catch (dbError) {
      console.error("Error al conectar con la base de datos:", dbError)
      dbConnection = {
        success: false,
        message: `Error al conectar con la base de datos: ${dbError instanceof Error ? dbError.message : "Error desconocido"}`,
      }
    }

    return NextResponse.json({
      success: isValid && shopifyConnection.success && dbConnection.success,
      message: isValid ? "Configuración del sistema correcta" : "Hay errores en la configuración del sistema",
      errors,
      config: {
        shopifyApiUrl: envConfig.shopifyApiUrl ? "Configurado" : "No configurado",
        shopifyAccessToken: envConfig.shopifyAccessToken ? "Configurado" : "No configurado",
        shopifyShopDomain: envConfig.shopifyShopDomain ? "Configurado" : "No configurado",
        databaseUrl: envConfig.databaseUrl ? "Configurado" : "No configurado",
        nextAuthSecret: envConfig.nextAuthSecret ? "Configurado" : "No configurado",
        nextAuthUrl: envConfig.nextAuthUrl ? "Configurado" : "No configurado",
        appUrl: envConfig.appUrl,
        isDevelopment: envConfig.isDevelopment,
      },
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
