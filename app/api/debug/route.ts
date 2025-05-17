import { NextResponse } from "next/server"

export async function GET() {
  // Obtener todas las variables de entorno (excepto las sensibles)
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
    // No incluir tokens o secretos
  }

  // Obtener todas las rutas API disponibles
  const apiRoutes = [
    "/api/sync/products",
    "/api/sync/productos",
    "/api/shopify/products",
    "/api/db/productos",
    "/api/debug",
  ]

  return NextResponse.json({
    status: "ok",
    message: "API de diagnóstico funcionando correctamente",
    timestamp: new Date().toISOString(),
    environment: env,
    apiRoutes,
  })
}
