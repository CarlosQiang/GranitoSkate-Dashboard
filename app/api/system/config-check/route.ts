import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar variables de entorno de la base de datos
    const databaseConfigured = !!(
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL ||
      (process.env.POSTGRES_HOST && process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD)
    )

    // Verificar variables de entorno de Shopify
    const shopifyConfigured = !!(process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN && process.env.SHOPIFY_ACCESS_TOKEN)

    // Verificar variables de entorno de autenticación
    const authConfigured = !!(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL)

    return NextResponse.json({
      database: databaseConfigured,
      shopify: shopifyConfigured,
      auth: authConfigured,
      details: {
        database: {
          postgres_url: !!process.env.POSTGRES_URL,
          database_url: !!process.env.DATABASE_URL,
          postgres_host: !!process.env.POSTGRES_HOST,
          postgres_user: !!process.env.POSTGRES_USER,
          postgres_password: !!process.env.POSTGRES_PASSWORD,
        },
        shopify: {
          shop_domain: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
          access_token: !!process.env.SHOPIFY_ACCESS_TOKEN,
          shop_domain_value: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || null,
        },
        auth: {
          nextauth_secret: !!process.env.NEXTAUTH_SECRET,
          nextauth_url: !!process.env.NEXTAUTH_URL,
        },
      },
    })
  } catch (error) {
    console.error("Error checking configuration:", error)
    return NextResponse.json(
      {
        error: "Error al verificar la configuración",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
