import { NextResponse } from "next/server"
import { envConfig, getConfigErrors } from "@/lib/config/env"

export async function GET() {
  try {
    // Definir las variables de entorno requeridas y opcionales
    const requiredVariables = [
      {
        name: "SHOPIFY_ACCESS_TOKEN",
        exists: Boolean(envConfig.shopifyAccessToken),
        required: true,
        description: "Token de acceso para la API de Shopify",
      },
      {
        name: "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN",
        exists: Boolean(envConfig.shopifyShopDomain),
        required: true,
        description: "Dominio de la tienda Shopify (sin https://)",
      },
      {
        name: "SHOPIFY_API_URL",
        exists: Boolean(envConfig.shopifyApiUrl),
        required: true,
        description: "URL de la API de Shopify",
      },
      {
        name: "POSTGRES_URL",
        exists: Boolean(envConfig.databaseUrl),
        required: true,
        description: "URL de conexión a la base de datos PostgreSQL",
      },
      {
        name: "NEXTAUTH_SECRET",
        exists: Boolean(envConfig.nextAuthSecret),
        required: true,
        description: "Secreto para NextAuth",
      },
      {
        name: "NEXTAUTH_URL",
        exists: Boolean(envConfig.nextAuthUrl),
        required: true,
        description: "URL de la aplicación para NextAuth",
      },
    ]

    const optionalVariables = [
      {
        name: "NEXT_PUBLIC_APP_URL",
        exists: Boolean(process.env.NEXT_PUBLIC_APP_URL),
        required: false,
        description: "URL pública de la aplicación",
      },
      {
        name: "NEXT_PUBLIC_VERCEL_URL",
        exists: Boolean(process.env.NEXT_PUBLIC_VERCEL_URL),
        required: false,
        description: "URL de Vercel para la aplicación",
      },
      {
        name: "VERCEL_REGION",
        exists: Boolean(process.env.VERCEL_REGION),
        required: false,
        description: "Región de Vercel donde se despliega la aplicación",
      },
    ]

    // Combinar todas las variables
    const allVariables = [...requiredVariables, ...optionalVariables]

    // Verificar si todas las variables requeridas están configuradas
    const allRequired = requiredVariables.every((variable) => variable.exists)

    // Obtener errores de configuración
    const configErrors = getConfigErrors()

    return NextResponse.json({
      success: true,
      allRequired,
      variables: Object.fromEntries(allVariables.map((variable) => [variable.name, variable])),
      configErrors: configErrors.length > 0 ? configErrors : null,
    })
  } catch (error) {
    console.error("Error al verificar variables de entorno:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error al verificar variables de entorno: ${error.message}`,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
