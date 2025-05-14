import { NextResponse } from "next/server"

export async function GET() {
  // Recopilar información sobre las variables de entorno (sin exponer valores sensibles)
  const envInfo = {
    NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: {
      configured: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
      value: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "no configurado",
    },
    SHOPIFY_ACCESS_TOKEN: {
      configured: !!process.env.SHOPIFY_ACCESS_TOKEN,
      // Solo mostrar los primeros 4 caracteres por seguridad
      value: process.env.SHOPIFY_ACCESS_TOKEN
        ? `${process.env.SHOPIFY_ACCESS_TOKEN.substring(0, 4)}...`
        : "no configurado",
    },
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
  }

  return NextResponse.json({
    success: true,
    envInfo,
  })
}
