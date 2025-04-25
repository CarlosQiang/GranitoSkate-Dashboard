import { NextResponse } from "next/server"

export async function GET() {
  // Verificar las variables de entorno críticas
  const envStatus = {
    NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
    SHOPIFY_ACCESS_TOKEN: !!process.env.SHOPIFY_ACCESS_TOKEN,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
  }

  // Verificar si todas las variables de entorno están configuradas
  const allEnvVarsSet = Object.values(envStatus).every(Boolean)

  return NextResponse.json(
    {
      status: allEnvVarsSet ? "ok" : "warning",
      message: allEnvVarsSet
        ? "La aplicación está funcionando correctamente"
        : "La aplicación está funcionando, pero faltan algunas variables de entorno",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL === "1" ? true : false,
      envStatus,
    },
    { status: 200 },
  )
}
