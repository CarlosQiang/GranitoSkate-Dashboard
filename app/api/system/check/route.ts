import { NextResponse } from "next/server"
import { testShopifyConnection } from "@/lib/shopify-client"
import { checkConnection } from "@/lib/db"
import { checkDatabaseConnection } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const dbStatus = await checkConnection()
    const prismaStatus = await checkDatabaseConnection()

    // Verificar conexión a Shopify
    const shopifyStatus = await testShopifyConnection()

    // Verificar variables de entorno críticas
    const envStatus = {
      NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
      SHOPIFY_STORE_DOMAIN: !!process.env.SHOPIFY_STORE_DOMAIN,
      SHOPIFY_ACCESS_TOKEN: !!process.env.SHOPIFY_ACCESS_TOKEN,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    }

    // Determinar el estado general del sistema
    const allEnvVarsPresent = Object.values(envStatus).every(Boolean)
    const systemOk = (dbStatus.connected || prismaStatus.connected) && shopifyStatus.success && allEnvVarsPresent

    return NextResponse.json({
      success: systemOk,
      status: {
        database: {
          pg: dbStatus,
          prisma: prismaStatus,
        },
        shopify: shopifyStatus,
        environment: envStatus,
      },
      message: systemOk
        ? "Todos los sistemas funcionando correctamente"
        : "Hay problemas con algunos componentes del sistema",
    })
  } catch (error) {
    console.error("Error al verificar el estado del sistema:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al verificar el estado del sistema",
      },
      { status: 500 },
    )
  }
}
