import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar variables de entorno de la base de datos
    const databaseVars = {
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      DATABASE_URL: !!process.env.DATABASE_URL,
      POSTGRES_HOST: !!process.env.POSTGRES_HOST,
      POSTGRES_USER: !!process.env.POSTGRES_USER,
      POSTGRES_PASSWORD: !!process.env.POSTGRES_PASSWORD,
      POSTGRES_DATABASE: !!process.env.POSTGRES_DATABASE,
    }

    // Verificar variables de entorno de Shopify
    const shopifyVars = {
      NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
      SHOPIFY_ACCESS_TOKEN: !!process.env.SHOPIFY_ACCESS_TOKEN,
    }

    // Verificar variables de entorno de autenticación
    const authVars = {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    }

    // Determinar el estado de cada sistema
    const database = Object.values(databaseVars).some(Boolean)
    const shopify = Object.values(shopifyVars).every(Boolean)
    const auth = Object.values(authVars).some(Boolean)

    return NextResponse.json({
      success: true,
      database,
      shopify,
      auth,
      details: {
        database: databaseVars,
        shopify: shopifyVars,
        auth: authVars,
      },
    })
  } catch (error) {
    console.error("Error checking config:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al verificar configuración",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
