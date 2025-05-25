import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar variables de entorno de la base de datos
    const databaseVars = ["POSTGRES_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL_NON_POOLING", "DATABASE_URL"]

    const hasDatabase = databaseVars.some((varName) => process.env[varName])

    // Verificar variables de Shopify
    const shopifyVars = ["NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN", "SHOPIFY_ACCESS_TOKEN"]

    const hasShopify = shopifyVars.every((varName) => process.env[varName])

    // Verificar variables de autenticación
    const authVars = ["NEXTAUTH_SECRET", "NEXTAUTH_URL"]

    const hasAuth = authVars.every((varName) => process.env[varName])

    return NextResponse.json({
      database: hasDatabase,
      shopify: hasShopify,
      auth: hasAuth,
      details: {
        database: {
          configured: hasDatabase,
          variables: databaseVars.map((varName) => ({
            name: varName,
            configured: !!process.env[varName],
          })),
        },
        shopify: {
          configured: hasShopify,
          variables: shopifyVars.map((varName) => ({
            name: varName,
            configured: !!process.env[varName],
          })),
        },
        auth: {
          configured: hasAuth,
          variables: authVars.map((varName) => ({
            name: varName,
            configured: !!process.env[varName],
          })),
        },
      },
    })
  } catch (error) {
    console.error("Error checking environment variables:", error)
    return NextResponse.json({ error: "Error checking configuration" }, { status: 500 })
  }
}
