import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Definir las variables de entorno requeridas y opcionales
    const envVariables = {
      // Variables de Shopify
      NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: {
        exists: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
        required: true,
        description: "Dominio de la tienda Shopify (ej: mi-tienda.myshopify.com)",
      },
      SHOPIFY_ACCESS_TOKEN: {
        exists: !!process.env.SHOPIFY_ACCESS_TOKEN,
        required: true,
        description: "Token de acceso a la API de Shopify",
      },
      SHOPIFY_API_URL: {
        exists: !!process.env.SHOPIFY_API_URL,
        required: false,
        description: "URL de la API de Shopify (se genera automáticamente si no se proporciona)",
      },

      // Variables de la base de datos
      POSTGRES_URL: {
        exists: !!process.env.POSTGRES_URL,
        required: true,
        description: "URL de conexión a la base de datos PostgreSQL",
      },
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        required: false,
        description: "URL alternativa de conexión a la base de datos",
      },

      // Variables de autenticación
      NEXTAUTH_URL: {
        exists: !!process.env.NEXTAUTH_URL,
        required: true,
        description: "URL base de la aplicación para NextAuth",
      },
      NEXTAUTH_SECRET: {
        exists: !!process.env.NEXTAUTH_SECRET,
        required: true,
        description: "Secreto para firmar las cookies de sesión",
      },

      // Variables de la aplicación
      NEXT_PUBLIC_API_URL: {
        exists: !!process.env.NEXT_PUBLIC_API_URL,
        required: false,
        description: "URL base de la API (se usa VERCEL_URL si no se proporciona)",
      },
      NEXT_PUBLIC_VERCEL_URL: {
        exists: !!process.env.NEXT_PUBLIC_VERCEL_URL,
        required: false,
        description: "URL de Vercel (proporcionada automáticamente en Vercel)",
      },
      VERCEL_REGION: {
        exists: !!process.env.VERCEL_REGION,
        required: false,
        description: "Región de Vercel (proporcionada automáticamente en Vercel)",
      },
    }

    // Verificar si todas las variables requeridas están configuradas
    const allRequired = Object.values(envVariables).every((variable) => !variable.required || variable.exists)

    // Contar variables configuradas y requeridas
    const configuredCount = Object.values(envVariables).filter((variable) => variable.exists).length
    const requiredCount = Object.values(envVariables).filter((variable) => variable.required).length
    const configuredRequiredCount = Object.values(envVariables).filter(
      (variable) => variable.required && variable.exists,
    ).length

    return NextResponse.json({
      variables: envVariables,
      allRequired,
      configuredCount,
      requiredCount,
      configuredRequiredCount,
      message: allRequired
        ? "Todas las variables de entorno requeridas están configuradas"
        : "Faltan algunas variables de entorno requeridas",
    })
  } catch (error) {
    console.error("Error al verificar las variables de entorno:", error)
    return NextResponse.json({ error: "Error al verificar las variables de entorno" }, { status: 500 })
  }
}
