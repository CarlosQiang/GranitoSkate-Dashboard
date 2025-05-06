import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar variables de entorno críticas
    const envVars = {
      NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN ? "defined" : "undefined",
      SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN ? "defined" : "undefined",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "defined" : "undefined",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "defined" : "undefined",
    }

    const missingVars = Object.entries(envVars)
      .filter(([_, value]) => value === "undefined")
      .map(([key]) => key)

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Variables de entorno faltantes: ${missingVars.join(", ")}`,
          details: envVars,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "API funcionando correctamente",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Error en el endpoint de salud: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}
