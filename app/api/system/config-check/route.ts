import { NextResponse } from "next/server"
import { testShopifyConnection } from "@/lib/shopify"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Verificar variables de entorno
    const envVars = {
      // Variables de Shopify
      NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN,
      SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN,
      SHOPIFY_API_URL: process.env.SHOPIFY_API_URL,

      // Variables de NextAuth
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,

      // Variables de base de datos
      POSTGRES_URL: process.env.POSTGRES_URL,

      // Variables de Vercel
      NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION,

      // Otras variables
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    }

    // Verificar conexión a Shopify
    const shopifyStatus = await testShopifyConnection()

    // Determinar el estado general de la configuración
    const requiredVars = ["NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN", "SHOPIFY_ACCESS_TOKEN", "NEXTAUTH_SECRET", "POSTGRES_URL"]
    const missingRequiredVars = requiredVars.filter((key) => !envVars[key])

    const configOk = missingRequiredVars.length === 0 && shopifyStatus.success

    return NextResponse.json({
      success: configOk,
      config: {
        environment: {
          variables: Object.fromEntries(Object.entries(envVars).map(([key, value]) => [key, !!value])),
          missingRequired: missingRequiredVars,
        },
        shopify: shopifyStatus,
      },
      message: configOk
        ? "Configuración correcta"
        : `Problemas de configuración: ${missingRequiredVars.length > 0 ? `Faltan variables requeridas: ${missingRequiredVars.join(", ")}` : ""} ${!shopifyStatus.success ? `Error de conexión a Shopify: ${shopifyStatus.message}` : ""}`,
    })
  } catch (error) {
    console.error("Error al verificar la configuración del sistema:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al verificar la configuración del sistema",
      },
      { status: 500 },
    )
  }
}
